export interface Destination {
  slug: string
  name: string
  state: string
  tagline: string
  heroImage: string
  guide: string
  bestTimeToVisit: string
  attractions: string[]
  food: string[]
  transportation: string
  propertyTypes: string[]
}

const UNSPLASH_IMAGES: Record<string, string> = {
  'dest-goa': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-manali': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-shimla': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-jaipur': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-udaipur': 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-mussoorie': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-coorg': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-ooty': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-rishikesh': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
  'dest-lonavala': 'https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp',
}

const img = (seed: string) => UNSPLASH_IMAGES[seed] || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&h=562&q=75&fm=webp`

export const DESTINATIONS: Destination[] = [
  {
    slug: 'goa',
    name: 'Goa',
    state: 'Goa',
    tagline: 'Beach villas and coastal getaways on India\'s favourite coastline',
    heroImage: img('dest-goa'),
    guide:
      'Goa remains India\'s most-loved beach destination, with North Goa\'s lively beach shacks and South Goa\'s quieter, palm-lined stretches offering very different holidays under the same sun. Innbly\'s Goa villas put you minutes from the sand, with private pools and gardens that make the stay itself part of the holiday rather than just a place to sleep between beach trips.',
    bestTimeToVisit: 'November to February, when the weather is dry and pleasantly warm — peak season books up fast, so reserve your villa early.',
    attractions: ['Candolim & Calangute beaches', 'Fort Aguada', 'Basilica of Bom Jesus', 'Chapora Fort', 'Dudhsagar Falls', 'Anjuna flea market'],
    food: ['Goan fish curry rice', 'Bebinca', 'Pork vindaloo', 'Beach shack seafood grills', 'Feni (local cashew spirit)'],
    transportation: 'Dabolim Airport (GOI) and Manohar International Airport (GOX) both serve Goa; Thivim and Madgaon are the main railway stations. Renting a scooter or car is the easiest way to get around once you\'ve checked in.',
    propertyTypes: ['Villas', 'Cottages'],
  },
  {
    slug: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'Riverside cottages and mountain cabins in the Kullu valley',
    heroImage: img('dest-manali'),
    guide:
      'Manali splits neatly into two moods: the buzzing Mall Road area for shopping and cafes, and Old Manali across the river for a quieter, backpacker-friendly pace with river-view cottages and easy access to trailheads. Innbly\'s Manali stays lean into that second mood — wood cabins and cottages with mountain views, bonfire decks, and fireplaces for the colder months.',
    bestTimeToVisit: 'March to June for pleasant weather and blooming valleys; December to February for snow, if you don\'t mind the cold.',
    attractions: ['Old Manali & Jogini Falls', 'Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Vashisht hot springs', 'Manu Temple'],
    food: ['Himachali dham', 'Siddu (steamed bread)', 'Trout fish curry', 'Cafe-style continental food in Old Manali', 'Butter tea'],
    transportation: 'Bhuntar Airport (KUU), about an hour away, is the nearest airport; Joginder Nagar is the closest railhead, though most travelers take an overnight bus or drive from Chandigarh or Delhi.',
    propertyTypes: ['Cottages', 'Cabins'],
  },
  {
    slug: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    tagline: 'Pine-forest cabins and colonial hill-station charm',
    heroImage: img('dest-shimla'),
    guide:
      'Shimla\'s old colonial core along the Ridge and Mall Road gets crowded in peak season, which is exactly why Innbly\'s cabins around Kufri and the quieter outskirts are worth the short drive — deodar forest views, fireplace evenings, and easy access to the Kufri ropeway without the Mall Road crowds.',
    bestTimeToVisit: 'March to June for clear valley views; December to February for snowfall around Kufri and Narkanda.',
    attractions: ['The Ridge & Mall Road', 'Kufri ropeway', 'Jakhoo Temple', 'Christ Church', 'Kufri Fun World', 'Chadwick Falls'],
    food: ['Himachali chana madra', 'Siddu', 'Tudkiya bhath', 'Bakery treats on Mall Road', 'Sea-buckthorn tea'],
    transportation: 'Shimla Airport (SLV) at Jubbarhatti has limited flights; the narrow-gauge Kalka–Shimla railway is a scenic alternative, and driving from Chandigarh takes roughly 3–4 hours.',
    propertyTypes: ['Cabins', 'Cottages'],
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'Restored havelis and rooftop courtyards in the Pink City',
    heroImage: img('dest-jaipur'),
    guide:
      'Jaipur rewards travelers who stay somewhere with character rather than a standard hotel room — Innbly\'s restored havelis near the old city put you a short walk or auto-ride from Hawa Mahal and the bazaars, with private courtyards and rooftop terraces that turn sunset into the day\'s main event.',
    bestTimeToVisit: 'October to March, when daytime temperatures are comfortable for exploring forts and markets on foot.',
    attractions: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar', 'Johari Bazaar', 'Nahargarh Fort viewpoint'],
    food: ['Dal baati churma', 'Lal maas', 'Pyaaz kachori', 'Ghewar', 'Lassi from Lassiwala'],
    transportation: 'Jaipur International Airport (JAI) and Jaipur Junction railway station both connect well to the rest of India; the old city itself is best explored on foot or by auto-rickshaw.',
    propertyTypes: ['Holiday Homes', 'Guest Houses'],
  },
  {
    slug: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'Lakefront havelis with views of Lake Pichola and the City Palace',
    heroImage: img('dest-udaipur'),
    guide:
      'Udaipur is best experienced from the water level up — a lakefront guesthouse with a rooftop restaurant overlooking Lake Pichola gives you the same view every evening that most visitors only see on a paid boat ride. Innbly\'s Udaipur stays sit within walking distance of the City Palace and the old city\'s ghats.',
    bestTimeToVisit: 'September to March, avoiding the pre-monsoon heat of April–June.',
    attractions: ['City Palace', 'Lake Pichola boat rides', 'Jagdish Temple', 'Saheliyon Ki Bari', 'Bagore Ki Haveli', 'Monsoon Palace viewpoint'],
    food: ['Dal baati churma', 'Lake Palace-style thalis', 'Mirchi bada', 'Rooftop cafe continental food', 'Rajasthani kachori'],
    transportation: 'Maharana Pratap Airport (UDR) and Udaipur City railway station are both close to the lake area; the old city is walkable once you\'re checked in.',
    propertyTypes: ['Guest Houses', 'Holiday Homes'],
  },
  {
    slug: 'mussoorie',
    name: 'Mussoorie',
    state: 'Uttarakhand',
    tagline: 'Cedar cottages in Landour\'s quiet colonial cantonment',
    heroImage: img('dest-mussoorie'),
    guide:
      'Skip the crowds on Mall Road and stay in Landour instead — Mussoorie\'s quieter cantonment neighbourhood, all cedar trees and colonial-era cottages, where mornings mean a walk to Char Dukan for the famous bun-omelette rather than fighting for a parking spot.',
    bestTimeToVisit: 'March to June for clear valley views and pleasant weather; September to November for post-monsoon clarity.',
    attractions: ['Lal Tibba viewpoint', 'Landour Bakehouse', 'Camel\'s Back Road', 'Kempty Falls', 'Company Garden', 'Char Dukan'],
    food: ['Bun omelette at Char Dukan', 'Landour Bakehouse pastries', 'Garhwali dal', 'Maggi at roadside viewpoints'],
    transportation: 'Jolly Grant Airport (DED) and Dehradun railway station are both roughly an hour and a half away by road; taxis from Dehradun run frequently.',
    propertyTypes: ['Cottages'],
  },
  {
    slug: 'coorg',
    name: 'Coorg',
    state: 'Karnataka',
    tagline: 'Colonial bungalows inside working coffee estates',
    heroImage: img('dest-coorg'),
    guide:
      'Coorg (Kodagu) is less about sightseeing and more about slowing down inside a working coffee estate — misty mornings among the plantations, a resident planter to explain how coffee actually gets from bush to cup, and waterfalls a short drive away for when you do want to get out.',
    bestTimeToVisit: 'October to March for pleasant weather; monsoon (June–September) turns the estates lush green if you don\'t mind rain.',
    attractions: ['Abbey Falls', 'Raja\'s Seat', 'Namdroling Monastery', 'Dubare Elephant Camp', 'Talakaveri', 'Coffee estate walks'],
    food: ['Pandi curry (pork)', 'Kadambuttu (rice dumplings)', 'Coorg-style filter coffee', 'Bamboo shoot curry'],
    transportation: 'Mangalore International Airport (IXE) and Mysuru railway station are the nearest transport hubs, both roughly 2.5–3 hours by road.',
    propertyTypes: ['Cottages'],
  },
  {
    slug: 'ooty',
    name: 'Ooty',
    state: 'Tamil Nadu',
    tagline: 'Tea-garden cottages in the Nilgiri hills',
    heroImage: img('dest-ooty'),
    guide:
      'Ooty\'s tea gardens are best appreciated from a cottage bordered by them, not just from a bus window — Innbly\'s Fernhill-area stays put you among the tea bushes with a private garden for morning walks, a short drive from Ooty Lake and the Botanical Gardens.',
    bestTimeToVisit: 'October to June; avoid the heaviest monsoon months (July–September) for outdoor sightseeing.',
    attractions: ['Ooty Lake', 'Government Botanical Garden', 'Doddabetta Peak', 'Nilgiri Mountain Railway', 'Tea estate tours', 'Rose Garden'],
    food: ['Nilgiri tea', 'Homemade chocolates', 'South Indian filter coffee', 'Varkey (local biscuit)'],
    transportation: 'Coimbatore Airport (CJB) is the nearest airport (~1.5–2 hours by road); the heritage Nilgiri Mountain Railway connects Ooty to Mettupalayam.',
    propertyTypes: ['Cottages'],
  },
  {
    slug: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Riverside cottages steps from the Ganga and Laxman Jhula',
    heroImage: img('dest-rishikesh'),
    guide:
      'Rishikesh works equally well as a yoga retreat base or an adventure-sports weekend — Innbly\'s Tapovan riverside cottages put you a five-minute walk from Laxman Jhula, riverside cafes, and rafting operators, with a private balcony over the Ganga for the quieter mornings in between.',
    bestTimeToVisit: 'September to April for pleasant weather and good rafting conditions; avoid peak monsoon (July–August) when the river runs high.',
    attractions: ['Laxman Jhula', 'Ram Jhula', 'Beatles Ashram', 'Triveni Ghat', 'White-water rafting', 'Neelkanth Mahadev Temple'],
    food: ['Riverside cafe all-day breakfasts', 'Sattvic (satvik) thalis', 'Fresh fruit smoothies', 'Local Garhwali dishes'],
    transportation: 'Jolly Grant Airport (DED) is about 45 minutes away; Rishikesh and Haridwar railway stations both connect well to Delhi.',
    propertyTypes: ['Cottages'],
  },
  {
    slug: 'lonavala',
    name: 'Lonavala',
    state: 'Maharashtra',
    tagline: 'Monsoon-green hill retreats a short drive from Mumbai and Pune',
    heroImage: img('dest-lonavala'),
    guide:
      'Lonavala is the classic weekend escape for Mumbai and Pune — waterfalls and valley viewpoints that turn spectacular in the monsoon, and private-pool villas that make a two-day trip feel like a proper holiday rather than just a drive out of the city.',
    bestTimeToVisit: 'June to September for lush monsoon greenery and waterfalls; October to February for cooler, clearer weather.',
    attractions: ['Tiger\'s Leap', 'Bhushi Dam', 'Karla & Bhaja Caves', 'Lohagad Fort', 'Rajmachi Point', 'Della Adventure Park'],
    food: ['Lonavala chikki (local sweet)', 'Vada pav', 'Misal pav', 'Maharashtrian thali'],
    transportation: 'Lonavala railway station sits on the Mumbai–Pune line, roughly a 2-hour drive from either city on the expressway.',
    propertyTypes: ['Villas', 'Cottages'],
  },
]

export function getDestinationBySlug(slug: string) {
  return DESTINATIONS.find((d) => d.slug === slug)
}
