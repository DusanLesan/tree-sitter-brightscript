sub init()
	logInfo("MainScene :: Init")

	setSceneBackgroundColor() ' inline comment with sub keyword in it
	var = "string value"
	m.grid = m.top.findNode("contentGrid")
end sub

' comment with end keyword in it
sub setter(index as integer)
	m.grid.focusIndex = index
end sub

' boolean return type function
function isFirstItemFocused() as boolean
	return m.grid.focusIndex = 0
end function
