// Globale variabler
var classifier      // Gemmer vores AI-model
var video           // Gemmer adgang til webcam
var mirror          // Et virtuelt lærred til at spejlvende videoen
var config          // Gemmer indstillinger og tekster fra config.json
var currentClass = ""  // Den klasse AI'en tror den ser lige nu
var previousClass = "" // Den forrige klasse (så vi kan se om det ændrer sig)

// Link til Teachable Machine-modellen
var url = "https://teachablemachine.withgoogle.com/models/6yFjg-Itx/"

function preload() {
  // Indlæs modellen før programmet starter
  classifier = ml5.imageClassifier(url + "model.json")
  // Indlæs konfigurationen
  config = loadJSON("config.json")
}

function setup() {
  noCanvas()

  // Lærred der kun bruges til AI-input (skjult)
  mirror = createGraphics(320, 240)

  // Tænd webcam med p5.js
  video = createCapture(VIDEO)
  video.size(320, 240)
  
  // Håndter debug-visning af video
  if (config.debug && config.debug.showVideo) {
    // Hvis vi vil se videoen, sæt den ind i containeren
    // Vi bruger p5.js DOM funktioner, men video objektet er p5.Element
    video.parent('videoDiv') 
    // Stylingen håndteres nu i style.css via #videoDiv video
  } else {
    // Ellers skjul den helt
    video.hide()
  }

  // Start AI-loopet
  classify() 
}

function classify() {
  // Spejlvend billedet så det matcher
  // det webcam man ser i Teachable Machine
  mirror.push()
  mirror.translate(mirror.width, 0) // Flyt til højre kant
  mirror.scale(-1, 1) // Spejlvend
  mirror.image(video, 0, 0)
  mirror.pop()

  // Spørg AI'en hvad den ser på det spejlvendte billede
  classifier.classify(mirror, function (results) {
    // Hent resultater
    if (results && results[0]) {
      var label = results[0].label // Ingen toLowerCase() da filerne har store bogstaver
      var confidence = results[0].confidence
      
      // Tjek om klassen har ændret sig OG vi er ret sikre (over 80%)
      if (label !== previousClass && confidence > 0.8) {
        currentClass = label
        shiftPage(currentClass) // Opdater kun skærmen ved skift
        previousClass = currentClass
      }
    }
    
    // Kør igen
    classify() 
  })
}

function shiftPage(className) {
  var pageView = select('#pageView')
  var pageImage = select('#pageImage')

  // Vi slår klassen op i vores config fil i stedet for at gætte filnavnet
  // Det gør det nemmere at ændre billeder uden at kode
  if (config.classes[className]) {
    var imgPath = config.classes[className].image
    
    // Opdater kilde og vis
    pageImage.attribute('src', imgPath)
    pageView.style('display', 'flex')
    
  } else {
    // Hvis klassen ikke findes i config (f.eks. Background Noise)
    console.log("Klassen '" + className + "' findes ikke i config.json")
  }
}

