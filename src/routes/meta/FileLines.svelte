<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { scale } from 'svelte/transition';
    import { flip as originalFlip } from 'svelte/animate';

    export let lines = [];
    export let colors;

    let files = [];
    $: {
        files = d3
            .groups(lines, (d) => d.file)
            .map(([name, lines]) => {return { name, lines };});
        files = d3.sort(files, d => -d.lines.length);
        }

    function getFlip() {
        return originalFlip;
    }
    $: flip = getFlip(files);
</script>

<dl class="files">
    {#each files as file (file.name)}
        <div animate:flip class="file-container">
            <dt>
                <code>{file.name}</code>
                <small>{file.lines.length} lines</small>
            </dt>
            <dd>
                {#each file.lines as line (line.line)}
                    <div 
                        class="line" 
                        style="--color: {colors(line.type)}"
                        in:scale={{ duration: 500 }}
                    ></div>
                {/each}
            </dd>
        </div>
    {/each}
</dl>


<style>
    .files {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1.5em;
    }

    .files > div {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: subgrid;
        grid-template-rows: subgrid;
        align-items: start;
        background: hsl(0 0% 100% / 90%);
        box-shadow: 0 0 0.2em 0.2em hsl(0 0% 100% / 90%);
    }

    .files dt {
        grid-column: 1;
        font-weight: bold;
        white-space: nowrap;
        color: #333;
    }

    .files dt small {
        display: block;
        font-size: 0.8em;
        opacity: 0.7;
        margin-top: 0.2em;
        color: #888;
    }

    .files dd {
        grid-column: 2;
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        align-content: start;
        gap: 0.15em;
        margin-left: 0;
        padding-top: 0.15em;
    }

    .line {
        display: flex;
        width: 0.3em;
        aspect-ratio: 1;
        background: var(--color, steelblue);
        border-radius: 50%;
    }
</style>