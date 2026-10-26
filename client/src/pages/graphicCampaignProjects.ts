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
    slug: '8x-merch',
    title: '8x Merch Drop',
    eyebrow: 'Live Brief · Merchandise',
    description:
      'A merchandise collection for 8x inspired by the everyday rituals of content creation. Five T-shirt designs, retro SD card keychains, phone charms and two sticker sheets bring together navy and coral graphics, halftone imagery and production-room humour.',
    layout: 'stack',
    media: [
      { src: '/assets/8x-merch-lifestyle_b66ddfcb.webp', alt: '8x Unscripted and Field Kit T-shirts worn by two models' },
      { src: '/assets/8x-merch-lit-from-the-front_670472c6.webp', alt: 'Lit From the Front — white 8x T-shirt front and back with a navy ring light and coral phone graphic' },
      { src: '/assets/8x-merch-just-one-more_d4f051a5.webp', alt: 'Just One More — white 8x T-shirt front and back with navy and coral looping graphics' },
      { src: '/assets/8x-merch-your-brief-their-lens_384d3c4a.webp', alt: 'Your Brief, Their Lens — white 8x T-shirt front and back with a halftone camera lens' },
      { src: '/assets/8x-merch-field-kit_e4db291f.webp', alt: 'Field Kit — white 8x T-shirt front and back with a phone and coral clip-on microphone' },
      { src: '/assets/8x-merch-unscripted_414d9ea4.webp', alt: 'Unscripted — white 8x T-shirt front and back with stacked navy lettering and coral framing marks' },
      { src: '/assets/8x-merch-sd-card-keychain_3cc0c655.webp', alt: 'Retro 8x SD card keychain, front and back, with a pixel-style recording label' },
      { src: '/assets/8x-merch-phone-charms_a3d1b7db.webp', alt: 'Black acrylic 8x phone charms, front and back, with a retro boot screen and white logo' },
      { src: '/assets/8x-merch-production-office-stickers_083dd28e.webp', alt: '8x Production Office sticker sheet with a clapperboard, recording icons and creator in-jokes' },
      { src: '/assets/8x-merch-retro-os-stickers_edca5e5f.webp', alt: '8x Retro OS sticker sheet with pixel cursors, export windows and editing graphics' },
    ],
  },
  {
    slug: 'playdoh',
    title: 'Play-Doh: Go Play With Your Food',
    eyebrow: 'Social Campaign · Hasbro',
    description:
      'A social series that turns Play-Doh into a menu — tagliatelle, burgers, fish and chips, pretzels, ice cream and baguettes, each with a tongue-twister name and the line "go play with your food". Recipe cards pair a playset with ideas for kids to make it their own.',
    note: 'Created during my social media marketing internship at Hasbro. Published on Play-Doh EMEA social channels.',
    layout: 'grid',
    media: [
      { src: '/assets/playdoh-01_579486b8.webp', alt: 'Play-Doh Twirly Tangly Tagliatelle — yellow dough grated into a bowl' },
      { src: '/assets/playdoh-02_41f70838.webp', alt: 'Play-Doh Smishy Smashy Burger Bash — stacked burger layers on red' },
      { src: '/assets/playdoh-03_ef7a1601.webp', alt: "Play-Doh Crunchy Munchy Fish 'n Chips on a wooden table" },
      { src: '/assets/playdoh-04_ff2a0f16.webp', alt: 'Play-Doh Doughy Loopy Pretzel — three salted pretzels on concrete' },
      { src: '/assets/playdoh-05_6dfe9e49.webp', alt: 'Play-Doh Swirly Twirly Ice Cream — green scoop in a metal scoop' },
      { src: '/assets/playdoh-06_f1ceef00.webp', alt: 'Play-Doh Bendy Bready Baguette — three yellow baguettes on a board' },
      { src: '/assets/playdoh-07_921dd68b.webp', alt: 'Play-Doh recipe card — Super Slice Cake Playset with a slice of cake' },
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
      { src: '/assets/mlp-01_dd0ded8f.webp', alt: 'Rainbow Dash flying over Ponyville with a rainbow trail' },
      { src: '/assets/mlp-02_f39c7736.webp', alt: 'Rarity walking a red carpet in the castle hall with a purple trail' },
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
      { src: '/assets/brita-01_9eb79522.webp', alt: 'Brita × AllTrails co-branded mark with a mountain illustration' },
      { src: '/assets/brita-02_88705700.webp', alt: 'Brita in Nature — month-long content calendar over a mountain valley' },
      { src: '/assets/brita-03_6f2b565c.webp', alt: 'Brita on the go — filter bottle breaking out of an Instagram post frame' },
    ],
  },
  {
    slug: 'hong-kong-zines',
    title: 'Hong Kong Street Notes',
    eyebrow: 'Personal Project · Print',
    description:
      'A series of two-ink, riso-style posters about walking Hong Kong — a street almanac for Causeway Bay, the tram down to the sea, and a red cab caught in the yellow box — plus a zine, a field note and a postcard. Halftone photography, heavy condensed type and small handwritten notes.',
    layout: 'grid',
    media: [
      { src: '/assets/hk-zine-01_16d29409.webp', alt: 'A Street Almanac — Causeway Bay, green and red two-ink poster' },
      { src: '/assets/hk-zine-02_cf0c88eb.webp', alt: 'Down to Sea — cyan and brick red halftone poster of a Hong Kong tram' },
      { src: '/assets/hk-zine-03_0c450e3d.webp', alt: 'Red Cab, Yellow Box — halftone street poster with a red taxi' },
      { src: '/assets/hk-zine-04_a8f0add5.webp', alt: 'Zine no. 01 — "slow / stop" road markings in safety orange over an ultramarine halftone street' },
      { src: '/assets/hk-zine-05_34ed38e4.webp', alt: 'Field Note 07 — green halftone of tree branches forking against the sky' },
      { src: '/assets/hk-zine-06_a04ae5d6.webp', alt: 'Hong Kong postcard, Causeway Bay — cobalt halftone street with a terracotta handwritten note' },
    ],
  },
];
