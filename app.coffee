# Project Info
# This info is presented in a widget when you share.
# http://framerjs.com/docs/#info.info

Framer.Info =
	title: "Travel App VR View"
	author: "Zhuyxuuan"
	description: "Travel App VR View using VRComponent"


Framer.Device.deviceType = "apple-iphone-7-black"
Screen.backgroundColor = "#000000"
{VRComponent, VRLayer} = require "VRComponent"

vr = new VRComponent
	front: "images/front.jpg"
	right: "images/right.jpg"
	left: "images/left.jpg"
	back: "images/back.jpg"
	bottom: "images/bottom.jpg"
	top: "images/top.jpg"
    
content = new Layer
	width: 750
	height: 400
	y: 934
	image: "images/content.png"

scroll = new ScrollComponent
    width: 750
    height: 1248

cover = new Layer
	parent: scroll.content
	width: 750
	height: 935
	image: "images/cover.png"

exitBtn = new Layer
	width: 21
	height: 33
	x: 40
	y: 40
	image: "images/exitBtn.png"

vrIcon = new Layer
	width: 160
	height: 124
	x: 295
	y: 397 + 20
	image: "images/vrIcon.png"

colBtn = new Layer
	width: 37
	height: 34
	x: 667
	y: 49
	image: "images/colBtn.png"

# pre setting
cover.opacity = 0
cover.y = 20
content.opacity = 0
content.y = 934 + 20
vrIcon.opacity = 0
exitBtn.opacity = 0
colBtn.opacity = 0
vr.opacity = 0
vr.scale = .2

cover.states.add
	show:
		opacity: 1
		y: 0
	hide:
		opacity:0

content.states.add
	show:
		y: 934
		opacity: 1
	hide:
		opacity:0

exitBtn.states.add
	show:
		opacity: 1
	hide:
		opacity:0
		
colBtn.states.add
	show:
		opacity: 1
	hide:
		opacity:0

vrIcon.states.add
	show:
		opacity: 1
	hide:
		visible: false
		opacity:0

vr.states.add
	show:
		opacity: 1
		scale: 1
	hide:
		opacity:0

exitBtn.states.switch("show",delay: 0.25)
colBtn.states.switch("show",delay: 0.25)
cover.states.switch("show",delay: 0.25)
content.states.switch("show",delay: 0.25)

#scroll & gesture setting 
scroll.scrollHorizontal = false 

scroll.on Events.Move, ->
	scrolltoY(scroll.scrollY)


scrolltoY = (y) ->
	scroll.scale = Utils.modulate(y, [0, -900], [1, 3], true)
	content.y = Utils.modulate(y, [0, -200], [934, 1300], true)
	vrIcon.scale = Utils.modulate(y, [0, -200], [.4, 1.4], true)
	vrIcon.opacity = Utils.modulate(y, [0, -90], [0, .8], true)	
	vrIcon.y = Utils.modulate(y, [0, -200], [397 + 40, 397], true)	
	
scroll.onTouchEnd ->
	if Math.abs(scroll.scrollY) > 50 && scroll.direction == "up"
		cover.states.switch("hide",time: .3)
		content.states.switch("hide",time: .3)
		vrIcon.states.switch("hide",time: .3)
		vr.states.switch("show",time: 1)
		vr.bringToFront()

