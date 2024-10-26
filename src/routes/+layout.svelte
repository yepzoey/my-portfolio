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
  <style>
    nav {
        --border-color: oklch(50% 10% 200 / 40%);
        display: flex;
        margin-bottom: 1em;
        border-bottom: 1px solid oklch(80% 3% 200);
    }

    nav a {
        flex: 1; 
        text-decoration: none;
        color: inherit; 
        text-align: center; 
    }

    .current {
        font-weight: bold;
        border-bottom: 0.4em solid oklch(80% 3% 200); 
        padding-bottom: 0.1em; 
    }

    nav a:hover {
        border-bottom: 0.4em solid var(--color-accent);
        background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
    }
  </style>