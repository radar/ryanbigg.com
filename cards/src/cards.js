import fuse from "fuse.js"

import cards from "../cards.json" with { type: "json" }
import debounce from "debounce"

const options = {
  keys: ["name"],
  includeScore: true,
  threshold: 0.1,
}

const fuseInstance = new fuse(cards, options)

function performSearch(event) {

  const query = event.target.value
  const searchResults = fuseInstance.search(query).slice(0, 10)

  results.innerHTML = ""

  searchResults.forEach(({ item }) => {
    const card = document.createElement("div")
    card.classList.add("card")

    const cardImage = document.createElement("img")
    cardImage.src = item.image
    cardImage.alt = `${item.name} - ${item.number} - ${item.set}`

    card.appendChild(cardImage)
    results.appendChild(card)
  })
}


document.addEventListener("DOMContentLoaded", function(event) {
  const searchInput = document.getElementById("search")
  const results = document.getElementById("results")

  const search = debounce(performSearch, 200)

  searchInput.addEventListener("keydown", search)
  searchInput.addEventListener("change", search)
});
