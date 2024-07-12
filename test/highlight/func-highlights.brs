sub init()
	logInfo("MainScene :: Init")

	setComponentAppearance() ' inline comment with sub keyword in it

	foo = "string value"
	bar = m.global.theme?.color
	m.grid = m.top.findNode("contentGrid")
end sub

' comment with end keyword in it
sub setFocusIndex(index as integer)
	if m.grid.content.count() <= index
		if index < 0 then index = 0
		m.grid.focusIndex = index
	end if
end sub

sub tryTest()
	try
		'print 1/0
	catch
		'? "Division failed: ", e
	end try
end sub

' object return type function
function getItemById(itemId as string, categoryId as string) as object
	if m.grid.content <> invalid and m.grid.content.count() > 0 then
		for each category in m.grid.content.getChildren(-1, 0)
			if category.id = categoryId then
				for i = 0 to category.count() - 1
					item = category[i]
					if item.id = itemId or item._id = itemId then
						return {
							id: item.id,
							index: i,
							poster: item.uri
						}
					end if
				end for
			else if category.index > 100
				exit for
			end if
		end for
	end if

	return invalid
end function
