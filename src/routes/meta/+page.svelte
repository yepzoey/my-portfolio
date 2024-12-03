<svelte:head>
  <title>Meta - Zoey Zhao</title>
</svelte:head>

<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import Pie from '$lib/Pie.svelte';
    import Scatterplot from './Scatterplot.svelte';
    import FileLines from './FileLines.svelte';
    import Scrolly from 'svelte-scrolly';

    let files = [];
    let data = [];
    let commits = [];
    let selectedCommits = [];
    let filteredLines = [];
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let numFiles = 0;
    let averageFileLength = 0;
    let averageLineLength = 0;
    let maxDepth = 0;
    let raceProgress = 0;

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

    let rScale;

    let commitProgress = 100;

    let timeScale;
    $: commitMaxTime = timeScale ? timeScale.invert(commitProgress) : null;

    $: filteredCommits = commitMaxTime
        ? commits.filter(commit => commit.datetime <= commitMaxTime)
        : commits;

    $: filteredLines = filteredCommits.flatMap(commit => commit.lines);

    $: files = d3.groups(data, (d) => d.file).map(([name, lines]) => ({
        name,
        lines,
        lastModified: d3.max(lines, (line) => line.datetime),
    }));

    let fileTimeScale;
    $: fileTimeScale = d3.scaleTime()
        .domain(d3.extent(files, (file) => file.lastModified))
        .range([0, 100]);

    $: raceMaxTime = timeScale ? timeScale.invert(raceProgress) : null;

    $: filteredFiles = raceMaxTime
        ? files.filter(file => file.lastModified <= raceMaxTime)
        : files;

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

        const [minDate, maxDate] = d3.extent(commits, d => d.datetime);
        timeScale = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, 100]);
    });

    $: hasSelection = selectedCommits.length > 0;

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

    $: pieData = Array.from(languageBreakdown).map(([id, lines]) => ({
        id,
        label: languageMap[id],
        value: lines
    }));

</script>

<h1>Meta</h1>
<p>
    This page includes stats about the code of this website. It's a fun way to explore the codebase and see how it has evolved over time.
</p>

<section>
    <dl class="stats">
        <dt>Total Commits</dt>
        <dd>{filteredCommits.length}</dd>

        <dt>Total <abbr title="Lines of Code">LOC</abbr></dt>
        <dd>{filteredLines.length}</dd>

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

<div class="scroll-date">
    {commitMaxTime?.toLocaleDateString("en", { dateStyle: "medium" })}
</div>

{#if commits.length}
<Scrolly bind:progress={commitProgress}>
    <h2>Evolution Over Time</h2>
    {#each commits as commit, index}
        <p>
            On {commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })},
            I made <a href="{commit.url}" target="_blank">{index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}</a>.
            I edited {commit.totalLines} lines across {d3.rollups(commit.lines, (d) => d.length, (d) => d.file).length} files.
            Then I looked over all I had made, and I saw that it was very good.
        </p>
    {/each}

    <svelte:fragment slot="viz">
        <h2>Commits by Time of Day</h2>
        <Scatterplot
            commits={filteredCommits}
            bind:selectedCommits={selectedCommits}
        />

        <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
        <Pie data={pieData} colors={colors} />
    </svelte:fragment>
</Scrolly>
{/if}

{#if files.length}
<Scrolly bind:progress={raceProgress} --scrolly-layout="viz-first" --scrolly-viz-width="1.5fr">
    {#each files as file, index}
        <p>
            File: {file.name} contains {file.lines.length} lines of code. 
            <a href="#">More details about this file.</a>
        </p>
    {/each}

    <svelte:fragment slot="viz">
        <h2>Codebase Evolution</h2>
        <FileLines lines={filteredLines} colors={colors} />
    </svelte:fragment>
</Scrolly>
{/if}

<style>
    :global(body) {
        max-width: min(120ch, 80vw);
    }

    .scroll-date {
        position: fixed;
        top: 90%;
        right: 1rem;
        transform: translateY(-50%);
        font-size: 0.9em;
        background: rgba(255, 255, 255, 0.8);
        padding: 0.2rem 0.5rem;
        border-radius: 0.25rem;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }

    .filtering {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }

    .slider-row {
        display: flex;
        align-items: center;
        gap: 1em;
    }

    .slider-row label {
        white-space: nowrap;
    }

    .slider-row input[type="range"] {
        flex: 1;
    }

    .filtering time {
        align-self: flex-end;
        font-size: 0.9em;
    }

</style>