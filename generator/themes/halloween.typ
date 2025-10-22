#let songs = json("../../generated/songs.json")

#let colorize(svg, color, alpha) = {
  let color_rgba = if color == black {
    "rgba(0, 0, 0, " + str(alpha) + ")"
  } else if color == white {
    "rgba(255, 255, 255, " + str(alpha) + ")"
  } else if color == rgb("#CCCCCC") {
    "rgba(204, 204, 204, " + str(alpha) + ")"
  } else {
    "rgba(0, 0, 0, " + str(alpha) + ")"  // fallback
  };

  svg.replace("fill=\"#000000\"", "fill=\"" + color_rgba + "\" ")
}

//this is a4
#let page_width = 210mm
#let page_height = 297mm

#let margin_x = 2cm
#let margin_y = 1cm

#let rows = 5
#let cols = 3
#let card_size = 5cm

#let marking_padding = 1cm

// Color palette
#let color_palette = (
  rgb("#262A20"),
  rgb("#43281A"),
  rgb("#3F5C5D"),
  rgb("#B65718"),
  rgb("#9FBCBF"),
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

// Function to determine if text should be black or white based on song index
// This maps to the color palette indices where dark colors use white text
#let get_text_color(song_index) = {
  let palette_size = color_palette.len()
  if song_index < palette_size {
    // Dark colors (indices 0, 1, 2) use light gray text (80% white), light colors (indices 3, 4) use black text
    if song_index <= 2 {
      rgb("#CCCCCC")  // Light gray instead of pure white
    } else {
      black
    }
  } else {
    get_text_color(song_index - palette_size)
  }
}

#let qr_front_side(song, song_index) = {
  let bg_color = get_card_color(song_index)
  let text_color = get_text_color(song_index)

  let qr_code = read("../../generated/qr-codes/" + song.id + ".svg")
  let colorized_qr_code = colorize(qr_code, text_color, 1.0)

  square(
    size: card_size,
    fill: bg_color,  // Use the same background color as the text side
    inset: 0.5cm,
    align(
      center,
      image.decode(colorized_qr_code, width: card_size - 1cm)
    )
  )
}

#let text_back_side(song, song_index) = {
  let bg_color = get_card_color(song_index)
  let text_color = get_text_color(song_index)

  // Random image and corner selection based on song index
  let corner = calc.rem(song_index, 4)  // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
  let is_top_corner = corner <= 1
  let image_name = if is_top_corner {
    "bat_0" + str(calc.rem(song_index, 9) + 1) + ".svg"
  } else {
    "tombstone_0" + str(calc.rem(song_index, 9) + 1) + ".svg"
  }
  let image_svg = read("../../generator/themes/images/" + image_name)
  let colorized_image = colorize(image_svg, text_color, 0.5)

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
        image.decode(colorized_image, width: 0.15 * card_size)
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
