/**
 * Graphic & Campaign projects. Each entry renders through CaseStudy at
 * /graphic-campaign/<slug>, and the section index lists them in this order.
 *
 * Add new visuals with the hash-naming helper:
 *   bash scripts/add-assets.sh <slug> <your-files...>
 */

import type { CaseStudyMedia } from '../components/CaseStudy';

export interface CampaignProject {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  note?: string;
  layout: 'grid' | 'stack';
  media: CaseStudyMedia[];
}

export const CAMPAIGN_PROJECTS: CampaignProject[] = [
  {
    slug: 'playdoh',
    title: 'Play-Doh: Go Play With Your Food',
    eyebrow: 'Social Campaign · Hasbro',
    description:
      'A social series that turns Play-Doh into a menu — tagliatelle, burgers, fish and chips, pretzels, ice cream and baguettes, each with a tongue-twister name and the line "go play with your food". Recipe cards pair a playset with ideas for kids to make it their own.',
    note: 'Created during my social media marketing internship at Hasbro. Published on Play-Doh EMEA social channels.',
    layout: 'grid',
    media: [
      { src: '/assets/playdoh-01_5fcc00af.webp', alt: 'Play-Doh Twirly Tangly Tagliatelle — yellow dough grated into a bowl' },
      { src: '/assets/playdoh-02_ce7e908f.webp', alt: 'Play-Doh Smishy Smashy Burger Bash — stacked burger layers on red' },
      { src: '/assets/playdoh-03_895cfb82.webp', alt: "Play-Doh Crunchy Munchy Fish 'n Chips on a wooden table" },
      { src: '/assets/playdoh-04_c327ee73.webp', alt: 'Play-Doh Doughy Loopy Pretzel — three salted pretzels on concrete' },
      { src: '/assets/playdoh-05_8f6343b4.webp', alt: 'Play-Doh Swirly Twirly Ice Cream — green scoop in a metal scoop' },
      { src: '/assets/playdoh-06_126ff0af.webp', alt: 'Play-Doh Bendy Bready Baguette — three yellow baguettes on a board' },
      { src: '/assets/playdoh-07_f495bfa1.webp', alt: 'Play-Doh recipe card — Super Slice Cake Playset with a slice of cake' },
    ],
  },
  {
    slug: 'my-little-pony',
    title: 'My Little Pony',
    eyebrow: 'Social Content · Hasbro',
    description:
      'Character-led social posts for My Little Pony — Rainbow Dash streaking over Ponyville at sunset and Rarity making an entrance down the castle hall, each trailing a ribbon of her own colours.',
    note: 'Created during my social media marketing internship at Hasbro. Published on My Little Pony EMEA social channels.',
    layout: 'grid',
    media: [
      { src: '/assets/mlp-01_968c2ca6.webp', alt: 'Rainbow Dash flying over Ponyville with a rainbow trail' },
      { src: '/assets/mlp-02_b97c7f67.webp', alt: 'Rarity walking a red carpet in the castle hall with a purple trail' },
    ],
  },
  {
    slug: 'brita',
    title: 'Brita × AllTrails',
    eyebrow: 'Live Brief · IRIS Worldwide',
    description:
      'A campaign concept pairing Brita with AllTrails to take filtered water outdoors — a co-branded identity, a month-long "Brita in Nature" content calendar of social posts, collabs and hiking events, and "Brita on the go" social creative for the filter bottle.',
    note: 'Live brief from IRIS Worldwide — our team won 1st place. Not commissioned by or affiliated with Brita or AllTrails.',
    layout: 'grid',
    media: [
      { src: '/assets/brita-01_3e607192.webp', alt: 'Brita × AllTrails co-branded mark with a mountain illustration' },
      { src: '/assets/brita-02_668383fe.webp', alt: 'Brita in Nature — month-long content calendar over a mountain valley' },
      { src: '/assets/brita-03_823c69de.webp', alt: 'Brita on the go — filter bottle breaking out of an Instagram post frame' },
    ],
  },
  {
    slug: 'hong-kong-zines',
    title: 'Hong Kong Street Notes',
    eyebrow: 'Personal Project · Print',
    description:
      'A series of two-ink, riso-style posters about walking Hong Kong — a street almanac for Causeway Bay, the tram down to the sea, and a red cab caught in the yellow box. Halftone photography, heavy condensed type and small handwritten notes.',
    layout: 'grid',
    media: [
      { src: '/assets/hk-zine-01_b1408c56.webp', alt: 'A Street Almanac — Causeway Bay, green and red two-ink poster' },
      { src: '/assets/hk-zine-02_c45e86f1.webp', alt: 'Down to Sea — cyan and brick red halftone poster of a Hong Kong tram' },
      { src: '/assets/hk-zine-03_a3864d36.webp', alt: 'Red Cab, Yellow Box — halftone street poster with a red taxi' },
    ],
  },
  {
    slug: 'landscape-flower-and-bird',
    title: 'Landscape Flower and Bird',
    eyebrow: 'Personal Project · Graphic',
    description:
      'A reworking of a traditional Chinese flower-and-bird painting — peach blossom, brushwork calligraphy and seal stamps pushed into hot pink and acid green.',
    layout: 'stack',
    media: [
      { src: '/assets/flowerbird_4eee1c54.webp', alt: 'Peach blossom painting with calligraphy in pink and green' },
    ],
  },
];
