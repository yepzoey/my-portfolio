<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article>
    <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt="{data.title}" class="project-image" />
    <div>
        <p>{data.description}</p>
        <p style="font-style: italic; color:darkgrey">{data.year}</p>
    </div>
</article>

<style>
  article {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 3;
  }

  h3 {
    margin-bottom: 0em;
  }

  .project-image {
        max-width: 100%;
        width: 277px;
        height: 138px;
    }
</style>
