module.exports = {
  title: 'ECS Machina',
  description: 'An Entity-Component-System library',

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
        'assemblage',
      ]
    }
  }
}