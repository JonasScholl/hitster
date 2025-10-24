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

#let qr_front_side(song) = {
  square(
    size: card_size,
    inset: 0.5cm,
    image(
      "../../generated/qr-codes/" + song.id + ".png",
      width: 100%
    )
  )
}

#let text_back_side(song) = {
  square(
    size: card_size,
    inset: 0.05 * card_size,
    stack(
      block(
        height: 0.25 * card_size,
        width: 100%,
        align(
          center + horizon,
          text(
            //for no-wrap of artist names
            song.artists.map(artist => box(artist)).join([, ]),
            weight: 500,
            size: 0.07 * card_size
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
            size: 0.25 * card_size
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
            size: 0.07 * card_size
          )
        )
      )
    )
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

  //add test and qr codes
  for page in songs.chunks(rows*cols) {
    let fronts = ()
    let backs = ()

    for song in page {
      fronts.push(qr_front_side(song))
      backs.push(text_back_side(song))
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
