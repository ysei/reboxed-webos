KioskMoviesAssistant = Class.create(BaseMoviesAssistant, {
  initialize: function($super, kiosk) {
    $super()
    this.kiosk = kiosk
    this.movieList = {items: []}
    this.movieSearchText = {value: ""}
  },

  setup: function($super) {
    $super()
    this.setUpGoBack();
    this.setupWidgets()
    this.setupListeners()
  },

  setupWidgets: function() {
    var listAttributes = {
			listTemplate: "movies/movies",
      itemTemplate: "movies/movie",
      onItemRendered: this.itemRendered.bind(this),
      dividerTemplate: "movies/divider",
  		dividerFunction: this.divideMovies,
      renderLimit: 30
    }

    this.controller.setupWidget("movies", listAttributes, this.movieList)
    this.controller.setupWidget("search-text", {changeOnKeyPress: true, hintText: "Movie search..."}, this.movieSearchText)
    this.controller.setupWidget("search-cancel", {}, {buttonClass: "secondary", buttonLabel: "Cancel"})
    this.controller.setupWidget("search-submit", {}, {buttonLabel: "Search"})
  },

  setupListeners: function() {
  	this.dragHandler = this.dragHandler.bind(this)
    this.movieTapped = this.movieTapped.bind(this)
  	this.searchMovies = this.searchMovies.bind(this)
  	this.searchTextEntry = this.searchTextEntry.bind(this)

    this.controller.listen("movies", Mojo.Event.listTap, this.movieTapped)
    this.controller.listen("search", Mojo.Event.tap, this.toggleMenuPanel)
  	this.controller.listen("search-cancel", Mojo.Event.tap, this.toggleMenuPanel)
  	this.controller.listen("search-submit", Mojo.Event.tap, this.searchMovies)
  	this.controller.listen("search-text", Mojo.Event.propertyChange, this.searchTextEntry)
  },

  ready: function() {
    this.controller.update("header", this.kiosk.vendor)
    this.spinnerOn("retrieving kiosk inventory")
    this.kiosk.loadInventory(this.inventorySuccess.bind(this), this.inventoryFailure.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.cleanUpGoBack();
    this.controller.stopListening("movies", Mojo.Event.listTap, this.movieTapped)
    this.controller.stopListening("search", Mojo.Event.tap, this.toggleMenuPanel)
  	this.controller.stopListening("search-cancel", Mojo.Event.tap, this.toggleMenuPanel)
  	this.controller.stopListening("search-submit", Mojo.Event.tap, this.searchMovies)
  	this.controller.stopListening("search-text", Mojo.Event.propertyChange, this.searchTextEntry)
  },

  activate: function($super, reload) {
    $("search-text").mojo.setConsumesEnterKey(false)

    $super(reload)

    if(true == reload) {
      this.refresh()
    }
  },
  
  refresh: function() {
    this.controller.stageController.swapScene("kiosk-movies", this.kiosk)    
  },

  inventorySuccess: function() {
    this.movieList.items.push.apply(this.movieList.items, this.kiosk.movies)
    this.controller.modelChanged(this.movieList)
    this.spinnerOff()
  },

  inventoryFailure: function() {
    this.spinnerOff()
    this.controller.get("inventory-failure").show()
  },

  searchTextEntry: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
      this.searchMovies()
    }
  },

  searchMovies: function() {
    if(this.movieSearchText.value && this.movieSearchText.value.length) {
      this.controller.stageController.pushScene("search-movies", this.movieSearchText.value, this.kiosk.movies, this.kiosk)
    }

    this.menuPanelOff()
  },

  menuPanelOn: function($super) {
	  this.movieSearchText.value = ""
	  this.controller.modelChanged(this.movieSearchText)
    $super("search-text")
  }
})
