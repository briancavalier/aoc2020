import { foldLeft, lines, map } from '../lib'

type Bag = string
type Contents = { bag: Bag, count: number }

// Reverse directed graph for part 1, bags point to bags that contain them
type BagsContainedBy = Graph<Bag, Bag>

// "Normal" directed graph for part 2, bags point to their contents
type BagContents = Graph<Bag, Contents>

// Simple directed graph
type Graph<Node extends PropertyKey, Edge> = Record<Node, readonly Edge[]>

// Parse a line into a directed graph
const parseBagContents = (s: string): BagContents => {
  const [container, ...contained] = s.split(/\s*(?:,|contain)\s*/)

  const m1 = /(\w+\s\w+)/.exec(container)
  if (!m1) return {}
  const bag = m1[1]
  const contents = contained.map(sss => /^(\d+)\s?(\w+\s\w+)/.exec(sss))
    .reduce((contents, m) => m ? [...contents, { bag: m[2], count: parseInt(m[1], 10) }] : contents, [] as Contents[])
  return { [bag]: contents }
}

const toBagsContainedBy = (bags: BagContents): BagsContainedBy => {
  const result: BagsContainedBy = {}
  for (const bag in bags)
    for (const contained of bags[bag])
      result[contained.bag] = [...(result[contained.bag] || []), bag]

  return result
}

// Merge 2 directed graphs
const mergeGraphs = <G extends Graph<string, unknown>>(b1: G, b2: G): G => {
  const merged: G = { ...b1 }
  for (const b2k in b2)
    merged[b2k] = [...(b1[b2k] || []), ...(b2[b2k])] as any

  return merged
}

// Collect all the bags that contain bag
// Unfortunately, Set's API is inconvenient, so use array to aggregate and then
// convert to Set at the end
const findContainers = (bags: BagsContainedBy, bag: Bag): Set<Bag> =>
  new Set(findBagsContaining(bags, bag))

const findBagsContaining = (bags: BagsContainedBy, bag: Bag): readonly Bag[] => {
  const containers = bags[bag]
  return containers
    ? [...containers, ...containers.flatMap(c => findBagsContaining(bags, c))]
    : []
}

// Count all the bags that bag contains
const countBagContents = (bags: BagContents, bag: Bag): number => {
  const contents = bags[bag]
  return contents
    ? contents.reduce((count, c) => count + c.count + (c.count * countBagContents(bags, c.bag)), 0)
    : 0
}

foldLeft(mergeGraphs, map(toBagsContainedBy, map(parseBagContents, lines(process.stdin))), {})
  .then(bags => console.log('shiny gold bag found in:', findContainers(bags, 'shiny gold').size))

foldLeft(mergeGraphs, map(parseBagContents, lines(process.stdin)), {})
  .then(bags => console.log('shiny gold bag contains:', countBagContents(bags, 'shiny gold')))
