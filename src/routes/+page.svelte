<script>
    import Projects from '$lib/Projects.svelte';
    import projects from '$lib/projects.json';
  </script>

<svelte:head>
  <title>Zoey Zhao's Portfolio</title>
</svelte:head>

<h1>Zoey Zhao</h1>
<img src="images/tangy.jpg" alt="A photo of my little orange cat named Tangy" width="300" height="400">
<p>This is my portfolio website for my Lab 4 submission!</p>

<h2>Latest Projects</h2>
<Projects projects={projects.slice(0, 3)} hLevel={3} />
  