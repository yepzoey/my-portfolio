<script>
    import * as d3 from 'd3';

    export let data = [];
    export let selectedIndex = -1;

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let arcData;
    let arcs;

    let sliceGenerator = d3.pie().value((d) => d.value);
    $: arcData = sliceGenerator(data);

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    $: arcs = arcData.map(d => arcGenerator(d));

    function toggleWedge(index, event) {
        if (!event.key || event.key === 'Enter') {
            selectedIndex = selectedIndex === index ? -1 : index;
        }
    }

    function handleMouseEnter(index) {
      arcs.forEach((_, i) => {
          const path = document.getElementById(`path-${i}`);
          path.style.opacity = i === index ? '1' : '0.5';
      });
    }

    function handleMouseLeave() {
      arcs.forEach((_, i) => {
          const path = document.getElementById(`path-${i}`);
          path.style.opacity = '1';
      });
    }
</script>

<div class="container">
    <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, i}
            <path 
                id="path-{i}"
                d={arc} 
                fill={colors(i)}
                class:selected={selectedIndex === i}
                tabindex="0"
                role="button"
                aria-label="Select wedge {i}"
                on:click={(e) => toggleWedge(i, e)}
                on:keyup={(e) => toggleWedge(i, e)}
                on:mouseenter={() => handleMouseEnter(i)}
                on:mouseleave={handleMouseLeave}
                on:focus={() => handleMouseEnter(i)}
                on:blur={handleMouseLeave}
                style="
                    --start-angle: { arcData[i]?.startAngle }rad;
                    --end-angle: { arcData[i]?.endAngle }rad;
                "
            />
        {/each}
    </svg>

    <ul class="legend">
        {#each data as d, i}
        <li 
            class:selected={selectedIndex === i}
            style="--color: {colors(i)}"
            on:click={() => toggleWedge(i)}
        >
            <span class="swatch"></span>
            {d.label} <em>({d.value})</em>
        </li>
        {/each}
    </ul>
</div>

<style>
    .container {
        display: flex;
        align-items: center;
        gap: 2em;
        max-width: 100%;
        margin: 0 auto;
        padding: 0em;
        min-width: 5em;
    }
    svg {
        max-width: 20em;
        height: auto;
        min-width: 10em;
        margin-block: 1em;
        overflow: visible;
        min-width: 15em;
        margin-bottom: 2em;
    }

    svg:has(path:hover, path:focus-visible) {
        path:not(:hover, :focus-visible) {
            opacity: 50%;
        }
    }

    path {
        transition: transform 300ms, opacity 300ms;
        cursor: pointer;
        outline: none;
        --angle: calc(var(--end-angle) - var(--start-angle));
        --mid-angle: calc(var(--start-angle) + var(--angle) / 2);
        transform: rotate(var(--mid-angle)) translateY(0) scale(1) rotate(calc(-1 * var(--mid-angle)));

        &.selected {
            transform: rotate(var(--mid-angle)) translateY(-6px) scale(1.1) rotate(
                calc(-1 * var(--mid-angle))
            );
        }
    }

    path:focus-visible {
        outline: 2px solid var(--color);
        outline-offset: 2px;
    }

    .selected {
        --color: oklch(87.35% 0.0839 11.65) !important;

        &:is(path) {
            fill: var(--color);
        }
    }

    .legend {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
        padding: 1em;
        margin: 1em 0;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f9f9f9;
        min-width: 8em;
        margin-left: 1em;
    }
    .legend li {
        display: flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.5em;
        border-radius: 4px;
    }
    .swatch {
        display: inline-block;
        width: 1em;
        height: 1em;
        aspect-ratio: 1 / 1;
        background-color: var(--color);
        border-radius: 50%;
    }
    .legend li em {
        font-style: italic;
        color: #666;
    }
</style>