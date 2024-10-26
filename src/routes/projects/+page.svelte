<script>
    import Projects from '$lib/Projects.svelte';
    import projects from '$lib/projects.json';
  </script>

<svelte:head>
  <title>Projects - Zoey Zhao</title>
</svelte:head>

<h1>{projects.length} Projects</h1>
<Projects projects={projects} hLevel={2} />
  