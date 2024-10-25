<script>
    import { page } from '$app/stores';
    import '../style.css';
  
    let pages = [
      { url: './', title: 'Home' },
      { url: './projects', title: 'Projects' },
      { url: './contact', title: 'Contact' },
      { url: './cv', title: 'CV' },
      { url: 'https://github.com/yepzoey', title: 'GitHub' }
    ];
  </script>
  
  <nav>
    {#each pages as p}
      <a href={p.url} class:current={'.' + $page.route.id === p.url}
         target={p.url.startsWith('http') ? '_blank' : null}>
        {p.title}
      </a>
    {/each}
  </nav>
  
  <slot />
  