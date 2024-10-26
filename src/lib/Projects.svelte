<script>
    import Project from '$lib/Project.svelte';
    export let projects = [];
    export let hLevel = 2;
</script>

<div class="projects">
  {#each projects as project}
    <Project data={project} hLevel={hLevel} />
  {/each}
</div>

<style>
  .projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15em, 1fr)); 
    gap: 1em;
  }
</style>
