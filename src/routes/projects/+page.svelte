<script>
  import * as d3 from 'd3';
  import Projects from '$lib/Projects.svelte';
  import projects from '$lib/projects.json';
  import Pie from '$lib/Pie.svelte';

  let query = '';
  let pieData;
  let selectedYearIndex = -1;
  let selectedYear;
  let filteredByYear;

  let filteredProjects;
  $: filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
  });

  $: {
      pieData = [];

      let rolledData = d3.rollups(
          filteredProjects,
          (v) => v.length,
          (d) => d.year
      );

      pieData = rolledData.map(([year, count]) => {
          return { value: count, label: year };
      });
  }

  $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;
  $: filteredByYear = selectedYear
      ? filteredProjects.filter((project) => project.year === selectedYear)
      : filteredProjects;  
</script>

<svelte:head>
<title>Projects - Zoey Zhao</title>
</svelte:head>

<h1>{projects.length} Projects</h1>

<Pie data="{pieData}" bind:selectedIndex="{selectedYearIndex}" />

<input
type="search"
bind:value="{query}"
aria-label="Search projects"
placeholder="🔍 Search projects…"
/>
<Projects projects="{filteredByYear}" hLevel="{2}" />

<style>
input[type="search"] {
    width: 100%;
    max-width: 400px;
    padding: 0.75em 1em;
    margin-top: 1em;
    margin-bottom: 1.5em;
    font-size: 1em;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    background-color: #f9f9f9;
    transition: box-shadow 0.3s, border-color 0.3s;
    color: #333;
}

input[type="search"]::placeholder {
    color: #888;
}

input[type="search"]:focus {
    border-color: #007bff;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
    background-color: #fff;
}
</style>