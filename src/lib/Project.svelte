<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article>
    <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt="{data.title}" />
    <p>{data.description}</p>
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
</style>
