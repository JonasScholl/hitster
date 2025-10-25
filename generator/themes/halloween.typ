#let songs = json("../../generated/songs.json")

//this is a4
#let page_width = 210mm
#let page_height = 297mm

#let margin_x = 1cm
#let margin_y = 1cm

#let rows = 4
#let cols = 3
#let card_size = 6cm

#let marking_padding = 0.5cm

// Color palette
#let color_palette = (
  rgb("#262A20"),
  rgb("#43281A"),
  rgb("#3F5C5D"),
  rgb("#B65718"),
  rgb("#574964"),
  rgb("#8C1007"),
)

#assert(rows * card_size + 2 * marking_padding + margin_y <= page_height)
#assert(cols * card_size + 2 * marking_padding + margin_x <= page_width)

#set page(
  width: page_width,
  height: page_height,
  margin: (
    x: margin_x,
    y: margin_y
  )
)

#set text(font: ("SF Pro Display", "sans-serif"))

#set square(
  stroke: none
)

// Function to get color for a song based on its index
#let get_card_color(song_index) = {
  let palette_size = color_palette.len()
  if song_index < palette_size {
    color_palette.at(song_index)
  } else {
    get_card_color(song_index - palette_size)
  }
}

// Function to convert RGB color to filename format based on song index
#let rgb_to_filename(song_index) = {
  let palette_size = color_palette.len()
  let actual_index = if song_index < palette_size {
    song_index
  } else {
    calc.rem(song_index, palette_size)
  }

  // Map palette indices to RGB values found in generated images
  if actual_index == 0 {
    "38_42_32"  // #262A20
  } else if actual_index == 1 {
    "67_40_26"  // #43281A
  } else if actual_index == 2 {
    "63_92_93"  // #3F5C5D
  } else if actual_index == 3 {
    "182_87_24" // #B65718
  } else if actual_index == 4 {
    "87_73_100" // #574964
  } else {
    "140_16_7" // #8C1007
  }
}

#let qr_front_side(song, song_index) = {
  let qr_code = image("../../generated/qr-codes/" + song.id + ".png", width: card_size - 1cm)
  square(
    size: card_size,
    fill: rgb(1, 0, 0),
    inset: 0.5cm,
    align(
      center,
      qr_code
    )
  )
}

#let text_back_side(song, song_index) = {
  let bg_color = get_card_color(song_index)
  let text_color = rgb("#F2F2F2")

  // Random image and corner selection based on song index
  let corner = calc.rem(song_index, 4)  // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
  let is_top_left_corner = corner == 0
  let is_top_right_corner = corner == 1
  let rgb_suffix = rgb_to_filename(song_index)
  let image_name = if is_top_left_corner {
    "bat_0" + str(calc.rem(song_index, 7) + 1) + "_" + rgb_suffix + ".png"
  } else if is_top_right_corner {
    "ghost_0" + str(calc.rem(song_index, 6) + 1) + "_" + rgb_suffix + ".png"
  }else {
    "tombstone_0" + str(calc.rem(song_index, 7) + 1) + "_" + rgb_suffix + ".png"
  }
  let image = image("../../generated/images/" + image_name, height: 0.15 * card_size)

  square(
    size: card_size,
    fill: bg_color,
    inset: 0.05 * card_size,
    [
      // Random corner image overlay
      #place(
        if corner == 0 {
          left + top
        } else if corner == 1 {
          right + top
        } else if corner == 2 {
          left + bottom
        } else {
          right + bottom
        },
        dx: if corner == 0 { -0.025 * card_size } else if corner == 1 { 0.025 * card_size } else { 0mm },
        dy: if corner < 2 { -0.025 * card_size } else { 0.05 * card_size  },
        image
      )

      // Main content
      #stack(
        block(
          height: 0.25 * card_size,
          width: 100%,
          align(
            center + horizon,
            text(
              //for no-wrap of artist names
              song.artists.map(artist => box(artist)).join([, ]),
              weight: 500,
              size: 0.07 * card_size,
              fill: text_color
            )
          ),
        ),
        block(
          height: 0.3 * card_size,
          width: 100%,
          align(
            center + horizon,
            text(
              weight: "black",
              str(song.year),
              size: 0.25 * card_size,
              fill: text_color
            )
          ),
        ),
        block(
          height: 0.35 * card_size,
          width: 100%,
          align(
            center + horizon,
            text(
              [_ #song.title _],
              weight: 500,
              size: 0.07 * card_size,
              fill: text_color
            )
          )
        )
      )
    ]
  )
}

#let marking_line = line(
  stroke: (
    paint: gray,
    thickness: 0.5pt
  ),
  length: marking_padding / 2
)

//a rotatable box with cut markings
#let marking(angle) = {
  rotate(
    angle,
    reflow: true,
    box(
      width: marking_padding,
      height: card_size,
      stack(
        spacing: card_size,
        ..(marking_line,) * 2
      )
    )
  )
}

//a row of markings
#let marking_row(angle) = {
  (
    square(
      size: marking_padding,
    ),
    ..(marking(angle),) * cols,
    square(
      size: marking_padding,
    ),
  )
}

#let pad_page(page) = {
  let rows = page.chunks(cols)

  //pad left and right
  let padded_rows = rows.map(
    row => (
      marking(0deg),
      row,
      marking(180deg)
    )
  )

  //pad top and bottom
  return (
    ..marking_row(90deg),
    ..padded_rows.flatten(),
    ..marking_row(270deg)
  )
}


#let get_pages(songs) = {
  let pages = ()
  let global_song_index = 0

  //add test and qr codes
  for page in songs.chunks(rows*cols) {
    let fronts = ()
    let backs = ()

    for song in page {
      fronts.push(qr_front_side(song, global_song_index))
      backs.push(text_back_side(song, global_song_index))
      global_song_index += 1
    }

    //fill remaining slots with empty boxes if needed
    for _ in range(rows * cols - page.len()) {
      fronts.push(
        square(
          size: card_size
        )
      )
      backs.push(
        square(
          size: card_size
        )
      )
    }

    //reverse back side
    let back_rows = backs.chunks(cols)
    let reversed_back_rows = back_rows.map(row => row.rev())
    let reversed_backs = reversed_back_rows.flatten()

    pages.push(pad_page(fronts))
    pages.push(pad_page(reversed_backs))
  }
  return pages
}

#for (i, page) in get_pages(songs).enumerate() {
  if i != 0 {
    pagebreak()
  }
  grid(
    columns: cols + 2,
    ..page
  )
}
