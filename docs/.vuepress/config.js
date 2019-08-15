module.exports = {
  title: 'ECS Machina',
  description: 'An Entity-Component-System library',
  base: '/ecs-machina/',

  plugins: ['@vuepress/last-updated'],

  themeConfig: {

    // Navbar
    nav: [{
        text: 'Home',
        link: '/'
      },
      {
        text: 'Guides',
        link: '/guides/'
      },
      {
        text: 'API',
        link: 'https://scambier.github.io/ecs-machina/api'
      },
      {
        text: 'Github',
        link: 'https://github.com/scambier/ecs-machina'
      },
    ],

    // Sidebar
    displayAllHeaders: false,
    sidebarDepth: 3,
    sidebar: {
      '/guides/': [
        'installation',
        'world',
        'entity',
        'component',
        'system',
      ]
    }
  }
}