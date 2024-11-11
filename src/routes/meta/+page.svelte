<svelte:head>
  <title>Meta - Zoey Zhao</title>
</svelte:head>

<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { computePosition, autoPlacement, offset } from '@floating-ui/dom';
    import Pie from '$lib/Pie.svelte';

    let data = [];
    let commits = [];
    let numFiles = 0;
    let averageFileLength = 0;
    let averageLineLength = 0;
    let maxDepth = 0;
    let svg;
    let brushSelection;

    let width = 1000,
        height = 600;

    let margin = { top: 10, right: 10, bottom: 30, left: 40 };
    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;
    
    let xScale, yScale, colorScale, rScale;
    let xAxis, yAxis, yAxisGridlines;

    let hoveredIndex = -1;

    let commitTooltip;
    let tooltipPosition = { x: 0, y: 0 };

    onMount(async () => {
        data = await d3.csv('loc.csv', (row) => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + 'T00:00' + row.timezone),
            datetime: new Date(row.datetime),
        }));

        commits = d3
            .groups(data, (d) => d.commit)
            .map(([commit, lines]) => {
                let first = lines[0];
                let { author, date, time, timezone, datetime } = first;
                let ret = {
                    id: commit,
                    url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                    author,
                    date,
                    time,
                    timezone,
                    datetime,
                    hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                    totalLines: lines.length,
                };

                Object.defineProperty(ret, 'lines', {
                    value: lines,
                    configurable: true,
                    writable: true,
                    enumerable: false,
                });

                return ret;
                });

        commits = d3.sort(commits, (d) => -d.totalLines);

        numFiles = d3.groups(data, d => d.file).length;
        averageFileLength = d3.mean(d3.rollups(data, v => v.length, d => d.file), d => d[1]);
        averageLineLength = d3.mean(data, d => d.length);
        maxDepth = d3.max(data, d => d.depth);

        const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
        rScale = d3.scaleSqrt()
            .domain([minLines, maxLines])
            .range([2, 30]);
    });

    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};

    $: if (commits.length) {
        xScale = d3.scaleTime()
            .domain(d3.extent(commits, d => d.datetime))
            .range([usableArea.left, usableArea.right])
            .nice();

        yScale = d3.scaleLinear()
            .domain([0, 24])
            .range([usableArea.bottom, usableArea.top])
            .nice();

        colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain([0, 24]);
    }

    $: if (xScale && yScale) {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(
            d3
                .axisLeft(yScale)
                .tickFormat(d => String(d % 24).padStart(2, '0') + ':00')
        );
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width)
        );
    }

    async function dotInteraction(index, evt) {
        if (evt.type === 'mouseenter' || evt.type === 'focus') {
            hoveredIndex = index;
            let hoveredDot = evt.target;

            tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
                strategy: 'fixed',
                middleware: [
                    offset(5),
                    autoPlacement()
                ]
            });
        } else if (evt.type === 'mouseleave' || evt.type === 'blur') {
            hoveredIndex = -1;
        }
    }

    $: {
        d3.select(svg).call(d3.brush().on('start brush end', brushed));
    }

    $: {
        const brush = d3.brush().on('start brush end', brushed);
        d3.select(svg).call(brush);
        d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
    }

    function brushed(evt) {
        brushSelection = evt.selection;
    }

    function isCommitSelected(commit) {
        if (!brushSelection) return false;
        const [x0, y0] = brushSelection[0];
        const [x1, y1] = brushSelection[1];
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    $: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    $: hasSelection = brushSelection && selectedCommits.length > 0;

    $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(
        (d) => d.lines,
    );

    $: languageBreakdown = d3.rollup(
        selectedLines,
        (lines) => lines.length,
        (line) => line.type
    );

    const languageMap = {
        svelte: "Svelte",
        css: "CSS",
        js: "JS",
        html: "HTML"
    };

    $: pieData = Array.from(languageBreakdown).map(([language, lines]) => ({
        label: languageMap[language] || language,
        value: lines
    }));

</script>

<h1>Meta</h1>

<section>
    <h2>Summary</h2>
    <dl class="stats">
        <dt>Total Commits</dt>
        <dd>{commits.length}</dd>

        <dt>Total <abbr title="Lines of Code">LOC</abbr></dt>
        <dd>{data.length}</dd>

        <dt>Files</dt>
        <dd>{numFiles}</dd>

        <dt>Avg File Length (lines)</dt>
        <dd>{averageFileLength.toFixed(2)}</dd>

        <dt>Avg Line Length (chars)</dt>
        <dd>{averageLineLength.toFixed(2)}</dd>

        <dt>Max Depth</dt>
        <dd>{maxDepth}</dd>
    </dl>
</section>

<h2>Commits by Time of Day</h2>
<svg viewBox="0 0 {width} {height}" bind:this={svg}>
    <g class="gridlines">
        {#if yScale && colorScale}
            {#each [...Array(25).keys()] as hour}
                <line
                    x1="{usableArea.left}" x2="{usableArea.right}"
                    y1="{yScale(hour)}" y2="{yScale(hour)}"
                    stroke="{colorScale(hour)}"
                    stroke-width="0.5"
                />
            {/each}
        {/if}
    </g>    
    <g transform="translate(0, {usableArea.bottom})" bind:this="{xAxis}" />
    <g transform="translate({usableArea.left}, 0)" bind:this="{yAxis}" />
    <g class="dots">
        {#each commits as commit, index}
            <circle
                cx="{xScale(commit.datetime)}"
                cy="{yScale(commit.hourFrac)}"
                r="{rScale(commit.totalLines)}"
                fill="steelblue"
                fill-opacity={hoveredIndex === index ? 1 : 0.7}
                tabindex="0"
                aria-describedby="commit-tooltip"
                aria-haspopup="true"
                on:mouseenter={evt => dotInteraction(index, evt)}
                on:mouseleave={evt => dotInteraction(index, evt)}
                on:focus={evt => dotInteraction(index, evt)}
                on:blur={evt => dotInteraction(index, evt)}
                class:selected={isCommitSelected(commit)}
            />
        {/each}
    </g>
</svg>

<dl id="commit-tooltip" class="info tooltip" bind:this="{commitTooltip}" hidden={hoveredIndex === -1} style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px">
    <dt>Commit</dt>
    <dd><a href="{hoveredCommit.url}" target="_blank">{hoveredCommit.id}</a></dd>
    
    <dt>Author</dt>
    <dd>{hoveredCommit.author}</dd>

    <dt>Date</dt>
    <dd>{hoveredCommit.datetime?.toLocaleString("en", { dateStyle: "full" })}</dd>

    <dt>Time</dt>
    <dd>{hoveredCommit.datetime?.toLocaleTimeString("en", { timeStyle: "short" })}</dd>

    <dt>Lines</dt>
    <dd>{hoveredCommit.totalLines}</dd>
</dl>

<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
<Pie data={pieData} />

<style>
    svg {
        overflow: visible;
        margin-top: 1.5rem;
    }
    .gridlines {
        stroke-opacity: 0.6;
    }
    dl.info {
        display: grid;
        grid-template-columns: auto 1fr;
        margin: 0;
        column-gap: 1em;
        row-gap: 0.2em;
    }

    dl.info dt {
        font-size: 0.75em;
        color: #666;
        text-transform: uppercase;
        align-self: center;
        margin: 0;
        grid-column: 1;
        grid-row: auto;
        text-align: end;
    }

    dl.info dd {
        font-size: 0.85em;
        margin: 0;
        font-weight: normal;
        color: #000;
        align-self: center;
        grid-column: 2;
        grid-row: auto;
    }
    .tooltip {
        position: fixed;
        top: 1em;
        left: 1em;
        background-color: rgba(250, 250, 250, 0.9);
        border-radius: 8px;
        border: 1px solid #ffffff;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        padding: 1em;
        backdrop-filter: blur(4px);
        transition: opacity 500ms, visibility 500ms;
        pointer-events: none;
        transition-duration: 500ms;
        transition-property: opacity, visibility;
    }
    .tooltip[hidden]:not(:hover, :focus-within) {
        opacity: 0;
        visibility: hidden;
    }
    circle {
        transition: 200ms;
        transform-origin: center;
        transform-box: fill-box;
    }
    circle:hover {
        transform: scale(1.5);
    }
    circle.selected {
        fill: rgb(255, 183, 154);
    }
    @keyframes marching-ants {
        to {
            stroke-dashoffset: -8;
        }
    }

    svg :global(.selection) {
        fill-opacity: 10%;
        stroke: black;
        stroke-opacity: 70%;
        stroke-dasharray: 5 3;
        animation: marching-ants 2s linear infinite;
    }

</style>