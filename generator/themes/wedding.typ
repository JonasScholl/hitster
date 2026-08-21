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
  rgb("#807362"),
  rgb("#D48B53"),
  rgb("#FFB556"),
  rgb("#E3C0AD"),
  rgb("#E0E0E3"),
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

#let get_card_color(song_index) = {
  let palette_size = color_palette.len()
  if song_index < palette_size {
    color_palette.at(song_index)
  } else {
    get_card_color(song_index - palette_size)
  }
}

#let rgb_to_filename(song_index) = {
  let palette_size = color_palette.len()
  let actual_index = if song_index < palette_size {
    song_index
  } else {
    calc.rem(song_index, palette_size)
  }

  if actual_index == 0 {
    "128_115_98"  // #807362
  } else if actual_index == 1 {
    "212_139_83"  // #D48B53
  } else if actual_index == 2 {
    "255_181_86"  // #FFB556
  } else if actual_index == 3 {
    "227_192_173" // #E3C0AD
  } else {
    "224_224_227" // #E0E0E3
  }
}

#let get_text_color(song_index) = {
  let palette_size = color_palette.len()
  let actual_index = if song_index < palette_size {
    song_index
  } else {
    calc.rem(song_index, palette_size)
  }
  // Dark ink on the lighter cards; light cream on the deeper taupe/terracotta
  if actual_index <= 1 {
    rgb("#FBF7F2")
  } else {
    rgb("#3A333E")
  }
}

#let pad2(n) = if n < 10 { "0" + str(n) } else { str(n) }

#let front_fill = rgb("#FAF6F0")

#let qr_front_side(song, song_index) = {
  let qr_code = image("../../generated/qr-codes/" + song.id + ".png", width: card_size - 1cm)
  square(
    size: card_size,
    fill: front_fill,
    inset: 0.5cm,
    align(
      center,
      qr_code
    )
  )
}

#let text_back_side(song, song_index) = {
  let bg_color = get_card_color(song_index)
  let text_color = get_text_color(song_index)

  let corner = calc.rem(song_index, 4)  // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
  let rgb_suffix = rgb_to_filename(song_index)
  let image_name = "wedding_" + pad2(calc.rem(song_index, 14) + 1) + "_" + rgb_suffix + ".png"
  let image = image("../../generated/images/" + image_name, height: 0.18 * card_size)

  square(
    size: card_size,
    fill: bg_color,
    inset: 0.05 * card_size,
    [
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

      #stack(
        block(
          height: 0.25 * card_size,
          width: 100%,
          align(
            center + horizon,
            text(
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

  let padded_rows = rows.map(
    row => (
      marking(0deg),
      row,
      marking(180deg)
    )
  )

  return (
    ..marking_row(90deg),
    ..padded_rows.flatten(),
    ..marking_row(270deg)
  )
}


#let get_pages(songs) = {
  let pages = ()
  let global_song_index = 0

  for page in songs.chunks(rows*cols) {
    let fronts = ()
    let backs = ()

    for song in page {
      fronts.push(qr_front_side(song, global_song_index))
      backs.push(text_back_side(song, global_song_index))
      global_song_index += 1
    }

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
  let is_front = calc.rem(i, 2) == 0
  let grid_w = cols * card_size + 2 * marking_padding
  let grid_h = rows * card_size + 2 * marking_padding
  if is_front {
    // Fill through the cut-mark gutters so imperfect cuts still show card color
    box(
      width: grid_w,
      height: grid_h,
      {
        place(rect(width: grid_w, height: grid_h, fill: front_fill))
        grid(
          columns: cols + 2,
          ..page
        )
      }
    )
  } else {
    grid(
      columns: cols + 2,
      ..page
    )
  }
}
