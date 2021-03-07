const loadButton = document.getElementById('load')
const list = document.getElementById('pokemans')
const buttonNext = document.getElementById('buttonNext')
const buttonPrev = document.getElementById('buttonPrev')
let next = null;
let previous = null; 

function populateList(url){
   fetchData(url).then(jsonData => {
      console.log(jsonData)
      clearList();
      jsonData.results.forEach(element => {
         list.innerHTML += `<li>${element.name}</li>`

      });
      next = jsonData.next;
      previous = jsonData.previous;
      getNextAndPrevious(jsonData);

      if(next) {
         buttonNext.innerHTML = " Next"
      } else {
         buttonNext.innerHTML = " "
      }
      if(previous) {
         buttonPrev.innerHTML = "Previous"      
      } else {
         buttonPrev.innerHTML = " "      
      }
   })
   

}


async function fetchData(url) {
   // console.log(url)
   const response = await fetch(url)
      .then(response => response.json())
      .then(responseData => {
         return responseData;
      })
      .catch(error => console.log(error)
      )
   return response;
}


const getNextAndPrevious = (json) => {
   if(json){

      return;
   }
   return;
}

const populateNext = () => {
   console.log("button pressed")
   if (next !== null) {
       populateList(next)
   } else {
       return
   }
}

const populatePrev = () => {
   console.log("button prev")
   if (previous !== null) {
       populateList(previous)
   } else {
       return
   }
}


const clearList = () => {
   list.innerHTML = '';
}
// ADD a click listener to our button
populateList('https://pokeapi.co/api/v2/pokemon?offset=0&limit=10')
buttonNext.addEventListener('click', populateNext);
buttonPrev.addEventListener('click', populatePrev);
