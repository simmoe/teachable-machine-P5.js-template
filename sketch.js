// Globale variabler
var classifier      // Gemmer vores AI-model
var video           // Gemmer adgang til webcam
var mirror          // Et virtuelt lærred til at spejlvende videoen
var config          // Gemmer indstillinger og tekster fra config.json
var currentClass = ""  // Den klasse AI'en tror den ser lige nu
var previousClass = "" // Den forrige klasse (så vi kan se om det ændrer sig)

// Link til Teachable Machine-modellen
var url = "https://teachablemachine.withgoogle.com/models/4Op_i__ud/"

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
      var label = results[0].label.toLowerCase().trim()
      var confidence = results[0].confidence
      
      // Tjek om klassen har ændret sig OG vi er ret sikre (over 80%)
      if (label !== previousClass && confidence > 0.8) {
        currentClass = label
        updateDisplay() // Opdater kun skærmen ved skift
        previousClass = currentClass
      }
    }
    
    // Kør igen
    classify() 
  })
}

function updateDisplay() {
  // Hent data for den nuværende klasse fra config
  // Vi tjekker om klassen findes i vores config
  var classData = config.classes[currentClass]
  
  if (classData) {
    // Opdater overskriften hvis config siger vi skal vise den
    if (config.debug.showLabel) {
      select('#className').html(classData.label)
    } else {
      select('#className').html("")
    }
    
    // Vælg en tilfældig besked
    var messages = classData.messages
    var randomMessage = random(messages) // p5.js random() funktion er nem
    
    // Opdater beskeden
    select('#message').html(randomMessage)

    // Opdater billede
    if (config.debug.showImage && classData.image) {
      select('#classImage').attribute('src', classData.image)
      select('#classImage').style('display', 'block')
    } else {
      select('#classImage').style('display', 'none')
    }
  }
}
