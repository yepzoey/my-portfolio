<script>
    import Projects from '$lib/Projects.svelte';
    import projects from '$lib/projects.json';

    let profileData = fetch('https://api.github.com/users/yepzoey');
  </script>

<svelte:head>
  <title>Zoey Zhao's Portfolio</title>
</svelte:head>

<h1>Zoey Zhao</h1>
<div class="image-container">
    <img src="images/tangy.jpg" alt="A photo of my little orange cat named Tangy" width="300" height="400">
</div>
<p>This is my portfolio website for my Lab 5 submission!</p>

{#await profileData}
  <p>Loading...</p>
{:then response}
  {#await response.json()}
    <p>Decoding...</p>
  {:then data}
    <section>
      <h2>My GitHub Stats</h2>
      <dl class="stats">
        <dt>Followers</dt>
        <dd>{data.followers}</dd>
        <dt>Following</dt>
        <dd>{data.following}</dd>
        <dt>Public Repositories</dt>
        <dd>{data.public_repos}</dd>
      </dl>
    </section>
  {:catch error}
    <p class="error">Something went wrong: {error.message}</p>
  {/await}
{:catch error}
  <p class="error">Something went wrong: {error.message}</p>
{/await}

<h2>Latest Projects</h2>
<Projects projects={projects.slice(0, 3)} hLevel={3} />

<style>
  .image-container {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
  }

  section {
    text-align: left;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 0.5rem;
    text-align: left;
    max-width: 800px;
  }

  dt {
    font-size: 0.75rem;
    color: color-mix(in srgb, GrayText 90%, Canvas 5%);
    text-transform: uppercase;
    grid-row: 1;
  }

  dd {
    font-size: 2rem;
    margin: 0;
    color: #000;
    grid-row: 2;
    color: inherit;
  }
</style>