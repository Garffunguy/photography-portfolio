/* ==============================
   PAGE ELEMENTS
   ============================== */

/* ==============================
   BUILD FEATURED CAROUSEL
   ============================== */

// Container that holds all carousel photographs
const carouselTrack =
    document.querySelector(".carousel-track");


// Create each photograph from the list in photos.js
featuredPhotos.forEach((photo) => {

    const image =
        document.createElement("img");

    image.src =
        `Images/Carousel/${photo.file}`;

    image.classList.add(
        "carousel-image"
    );

    image.alt =
        photo.title || "";


    /* ------------------------------
       OPTIONAL PHOTO INFORMATION
       ------------------------------ */

    if (photo.title) {
        image.dataset.title =
            photo.title;
    }

    if (photo.camera) {
        image.dataset.camera =
            photo.camera;
    }

    if (photo.focal) {
        image.dataset.focal =
            photo.focal;
    }

    if (photo.aperture) {
        image.dataset.aperture =
            photo.aperture;
    }

    if (photo.shutter) {
        image.dataset.shutter =
            photo.shutter;
    }

    if (photo.iso) {
        image.dataset.iso =
            photo.iso;
    }


    // Add the completed photograph to the carousel
    carouselTrack.appendChild(image);
});


// All photographs now created inside the carousel
const images =
    document.querySelectorAll(".carousel-image");


// Normal carousel buttons
const previousButton =
    document.querySelector(".carousel-button.previous");

const nextButton =
    document.querySelector(".carousel-button.next");


// Fullscreen lightbox
const lightbox =
    document.getElementById("lightbox");

const lightboxContent =
    document.querySelector(".lightbox-content");

const lightboxImage =
    document.getElementById("lightboxImage");


// Fullscreen controls
const lightboxClose =
    document.getElementById("lightboxClose");

const lightboxPrevious =
    document.getElementById("lightboxPrevious");

const lightboxNext =
    document.getElementById("lightboxNext");


// Fullscreen photo information
const lightboxTitle =
    document.getElementById("lightboxTitle");

const lightboxExif =
    document.getElementById("lightboxExif");


/* ==============================
   WEBSITE STATE
   ============================== */

// Which photograph is currently selected
let currentIndex = 0;


// Whether fullscreen is currently open
let lightboxOpen = false;


// Prevent two animations from overlapping
let lightboxAnimating = false;


// If another arrow is pressed during an animation,
// remember that direction instead of ignoring it.
let pendingDirection = null;


// What kind of photo is currently open fullscreen
let lightboxSource = "featured";


// Which collection is currently open
let activeCollection = null;


// Which photo inside that collection is fullscreen
let collectionPhotoIndex = 0;


/* ==============================
   BUILD COLLECTION CARDS
   ============================== */

const collectionGrid =
    document.querySelector(".collection-grid");


collections.forEach((collection) => {

    const card =
        document.createElement("div");

    card.classList.add(
        "collection-card"
    );


    const image =
        document.createElement("img");

    image.src =
        `Images/Collections/${collection.folder}/${collection.cover}`;

    image.alt =
        collection.name;


    const label =
        document.createElement("div");

    label.classList.add(
        "collection-label"
    );

    label.textContent =
        collection.name;
        /* ------------------------------
            COLLECTION PHOTO COUNT
            ------------------------------ */

    const photoCount =
        document.createElement("div");

    photoCount.classList.add(
        "collection-count"
    );

    photoCount.textContent =
        `${collection.photos.length} ${
            collection.photos.length === 1
                ? "PHOTOGRAPH"
                : "PHOTOGRAPHS"
        }`;


    card.appendChild(image);
    card.appendChild(label);
    card.appendChild(photoCount);

    collectionGrid.appendChild(card);
});


/* ==============================
   COLLECTION VIEWER
   ============================== */

const collectionViewer =
    document.getElementById("collectionViewer");

const collectionViewerClose =
    document.getElementById("collectionViewerClose");

const collectionViewerTitle =
    document.getElementById("collectionViewerTitle");

const collectionPhotoGrid =
    document.getElementById("collectionPhotoGrid");


/* ==============================
   OPEN COLLECTION
   ============================== */

function openCollection(collection) {

    activeCollection = collection;

    document.body.classList.add(
        "no-scroll"
    );


    // Set collection title
    collectionViewerTitle.textContent =
        collection.name;


    // Remove photos from the previous collection
    collectionPhotoGrid.innerHTML = "";

    /* ==============================
       BUILD COLLECTION GALLERY
       ============================== */

    // Keep the original photo order
    // for fullscreen navigation
    const originalPhotos =
        collection.photos;


    // Reorder photos only for
    // the CSS column layout
    const columnCount = 3;

    const reorderedPhotos = [];

    const rowCount =
        Math.ceil(
            originalPhotos.length /
            columnCount
        );


    for (
        let column = 0;
        column < columnCount;
        column++
    ) {

        for (
            let row = 0;
            row < rowCount;
            row++
        ) {

            const originalIndex =
                row * columnCount + column;


            if (
                originalIndex <
                originalPhotos.length
            ) {

                reorderedPhotos.push({
                    file:
                        originalPhotos[
                            originalIndex
                        ],

                    originalIndex:
                        originalIndex
                });
            }
        }
    }


    // Create the gallery images
    reorderedPhotos.forEach((photo) => {

        const img =
            document.createElement("img");

        img.src =
            `Images/Collections/${collection.folder}/${photo.file}`;

        img.alt =
            `${collection.name} photograph`;


        img.addEventListener(
            "click",
            () => {

                lightboxOpen = true;

                lightboxSource =
                    "collection";


                // Use the ORIGINAL
                // reading-order index
                collectionPhotoIndex =
                    photo.originalIndex;


                updateLightbox();

                lightbox.classList.add(
                    "open"
                );
            }
        );


        collectionPhotoGrid.appendChild(
            img
        );
    });


    // Show collection
    collectionViewer.classList.add(
        "open"
    );
}


/* ==============================
   CLOSE COLLECTION
   ============================== */

function closeCollection() {

    collectionViewer.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "no-scroll"
    );
}


/* ==============================
   COLLECTION CARD CLICKS
   ============================== */

const collectionCards =
    document.querySelectorAll(
        ".collection-card"
    );


collectionCards.forEach(
    (card, index) => {

        card.addEventListener(
            "click",
            () => {

                openCollection(
                    collections[index]
                );
            }
        );
    }
);


/* ==============================
   COLLECTION CLOSE BUTTON
   ============================== */

collectionViewerClose.addEventListener(
    "click",
    () => {

        closeCollection();
    }
);


/* ==============================
   NORMAL CAROUSEL
   ============================== */

function updateCarousel() {

    // Remove the old carousel positions
    images.forEach((image) => {

        image.classList.remove(
            "active",
            "previous",
            "next"
        );
    });


    // Find the image before
    // the current one
    const previousIndex =
        (
            currentIndex
            - 1
            + images.length
        )
        % images.length;


    // Find the image after
    // the current one
    const nextIndex =
        (
            currentIndex
            + 1
        )
        % images.length;


    // Assign the three visible positions
    images[currentIndex]
        .classList.add(
            "active"
        );

    images[previousIndex]
        .classList.add(
            "previous"
        );

    images[nextIndex]
        .classList.add(
            "next"
        );
}


/* ==============================
   MOVE CAROUSEL FORWARD
   ============================== */

function moveCarouselNext() {

    currentIndex++;


    if (
        currentIndex >=
        images.length
    ) {

        currentIndex = 0;
    }


    updateCarousel();
}


/* ==============================
   MOVE CAROUSEL BACKWARD
   ============================== */

function moveCarouselPrevious() {

    currentIndex--;


    if (currentIndex < 0) {

        currentIndex =
            images.length - 1;
    }


    updateCarousel();
}


/* ==============================
   LIGHTBOX PHOTO INFORMATION
   ============================== */

function updateLightbox() {


    /* ------------------------------
       COLLECTION PHOTO
       ------------------------------ */

    if (
        lightboxSource ===
            "collection"
        &&
        activeCollection
    ) {

        const photoFile =
            activeCollection.photos[
                collectionPhotoIndex
            ];


        lightboxImage.src =
            `Images/Collections/${activeCollection.folder}/${photoFile}`;


        /* ------------------------------
           COLLECTION PHOTO METADATA
           ------------------------------ */

        const metadataKey =
            `${activeCollection.folder}/${photoFile}`;

        const metadata =
            photoMetadata[metadataKey];


        lightboxTitle.textContent = "";


        if (metadata) {

            const exifParts = [
                metadata.camera,
                metadata.focal,
                metadata.aperture,
                metadata.shutter,
                metadata.iso
                    ? `ISO ${metadata.iso}`
                    : ""
            ].filter(Boolean);


            lightboxExif.textContent =
                exifParts.join(" · ");


            /* Photo has metadata */
            lightboxContent.classList.remove(
                "no-info"
            );
        }

        else {

            lightboxExif.textContent = "";


            /* No metadata — center photo */
            lightboxContent.classList.add(
                "no-info"
            );
        }


        return;
    }


    /* ------------------------------
       FEATURED PHOTO
       ------------------------------ */

    const image =
        images[currentIndex];


    lightboxImage.src =
        image.src;


    lightboxTitle.textContent =
        image.dataset.title || "";


    const exif = [

        image.dataset.camera,

        image.dataset.focal,

        image.dataset.aperture,

        image.dataset.shutter,

        image.dataset.iso
            ? `ISO ${image.dataset.iso}`
            : ""

    ].filter(Boolean);


    lightboxExif.textContent =
        exif.join(" · ");


    /* ------------------------------
       CHECK FOR ANY PHOTO INFO
       ------------------------------ */

    if (
        lightboxTitle.textContent ||
        exif.length > 0
    ) {

        lightboxContent.classList.remove(
            "no-info"
        );

    }

    else {

        lightboxContent.classList.add(
            "no-info"
        );
    }
}



/* ==============================
   OPEN FULLSCREEN
   ============================== */

function openLightbox() {

    lightboxOpen = true;

    lightboxSource =
        "featured";


    updateLightbox();


    lightbox.classList.add(
        "open"
    );


    document.body.classList.add(
        "no-scroll"
    );
}


/* ==============================
   CLOSE FULLSCREEN
   ============================== */

function closeLightbox() {

    lightboxOpen = false;

    pendingDirection = null;


    lightbox.classList.remove(
        "open"
    );


    /*
    If a collection is still open
    underneath fullscreen, keep the
    page locked.

    Otherwise restore page scrolling.
    */

    if (
        !collectionViewer.classList
            .contains("open")
    ) {

        document.body.classList.remove(
            "no-scroll"
        );
    }


    /*
    Wait until the fullscreen fade
    finishes, then make the carousel
    underneath catch up.
    */

    setTimeout(
        () => {

            updateCarousel();

        },
        450
    );
}


/* ==============================
   FULLSCREEN PHOTO NAVIGATION
   ============================== */

function animateLightbox(direction) {

    /*
    If an animation is already running,
    remember the newest arrow press.
    */

    if (lightboxAnimating) {

        pendingDirection =
            direction;

        return;
    }


    lightboxAnimating = true;


    /* ------------------------------
       CHOOSE DIRECTION
       ------------------------------ */

    let exitClass;

    let prepareClass;


    if (direction === "next") {

        // Old photo leaves left
        exitClass =
            "slide-out-left";


        // New photo begins on right
        prepareClass =
            "prepare-from-right";

    } else {

        // Old photo leaves right
        exitClass =
            "slide-out-right";


        // New photo begins on left
        prepareClass =
            "prepare-from-left";
    }


    /* ------------------------------
       OLD PHOTO EXITS
       ------------------------------ */

    lightboxContent.classList.add(
        exitClass
    );


    setTimeout(
        () => {


            /* ------------------------------
               CHANGE CURRENT PHOTO
               ------------------------------ */

            if (
                lightboxSource ===
                "collection"
            ) {


                /* ------------------------------
                   COLLECTION NAVIGATION
                   ------------------------------ */

                if (
                    direction ===
                    "next"
                ) {

                    collectionPhotoIndex++;


                    if (
                        collectionPhotoIndex >=
                        activeCollection.photos
                            .length
                    ) {

                        collectionPhotoIndex =
                            0;
                    }

                } else {

                    collectionPhotoIndex--;


                    if (
                        collectionPhotoIndex <
                        0
                    ) {

                        collectionPhotoIndex =
                            activeCollection
                                .photos
                                .length
                            - 1;
                    }
                }

            } else {


                /* ------------------------------
                   FEATURED NAVIGATION
                   ------------------------------ */

                if (
                    direction ===
                    "next"
                ) {

                    currentIndex++;


                    if (
                        currentIndex >=
                        images.length
                    ) {

                        currentIndex =
                            0;
                    }

                } else {

                    currentIndex--;


                    if (
                        currentIndex <
                        0
                    ) {

                        currentIndex =
                            images.length
                            - 1;
                    }
                }
            }


            // Swap photo and information
            updateLightbox();


            /* ------------------------------
               POSITION NEW PHOTO
               ------------------------------ */

            lightboxContent.classList.remove(
                "slide-out-left",
                "slide-out-right"
            );


            /*
            Instantly position the new
            photograph on the correct
            side of the screen.
            */

            lightboxContent.classList.add(
                prepareClass
            );


            /*
            Force the browser to apply
            that starting position first.
            */

            void lightboxContent.offsetWidth;


            /* ------------------------------
               MOVE NEW PHOTO INTO CENTER
               ------------------------------ */

            lightboxContent.classList.add(
                "slide-in"
            );


            lightboxContent.classList.remove(
                "prepare-from-right",
                "prepare-from-left"
            );


            /* ------------------------------
               FINISH ANIMATION
               ------------------------------ */

            setTimeout(
                () => {

                    lightboxContent
                        .classList
                        .remove(
                            "slide-in"
                        );


                    lightboxAnimating =
                        false;


                    // Run a queued arrow press
                    if (
                        pendingDirection !==
                        null
                    ) {

                        const nextDirection =
                            pendingDirection;


                        pendingDirection =
                            null;


                        animateLightbox(
                            nextDirection
                        );
                    }

                },
                260
            );

        },
        100
    );
}


/* ==============================
   NORMAL CAROUSEL BUTTONS
   ============================== */

nextButton.addEventListener(
    "click",
    () => {

        moveCarouselNext();
    }
);


previousButton.addEventListener(
    "click",
    () => {

        moveCarouselPrevious();
    }
);


/* ==============================
   CLICKING CAROUSEL PHOTOS
   ============================== */

images.forEach(
    (image, index) => {

        image.addEventListener(
            "click",
            () => {


                /* ------------------------------
                   CLICK CENTER PHOTO
                   ------------------------------ */

                if (
                    index ===
                    currentIndex
                ) {

                    openLightbox();

                    return;
                }


                /* ------------------------------
                   FIND ADJACENT PHOTOS
                   ------------------------------ */

                const previousIndex =
                    (
                        currentIndex
                        - 1
                        + images.length
                    )
                    % images.length;


                const nextIndex =
                    (
                        currentIndex
                        + 1
                    )
                    % images.length;


                /* ------------------------------
                   CLICK LEFT PHOTO
                   ------------------------------ */

                if (
                    index ===
                    previousIndex
                ) {

                    currentIndex =
                        previousIndex;


                    updateCarousel();


                    /*
                    Wait for carousel movement
                    to finish, then open the
                    selected photo fullscreen.
                    */

                    setTimeout(
                        () => {

                            openLightbox();

                        },
                        450
                    );


                    return;
                }


                /* ------------------------------
                   CLICK RIGHT PHOTO
                   ------------------------------ */

                if (
                    index ===
                    nextIndex
                ) {

                    currentIndex =
                        nextIndex;


                    updateCarousel();


                    /*
                    Wait for carousel movement
                    to finish, then open the
                    selected photo fullscreen.
                    */

                    setTimeout(
                        () => {

                            openLightbox();

                        },
                        450
                    );


                    return;
                }


                updateCarousel();
            }
        );
    }
);


/* ==============================
   FULLSCREEN ARROW BUTTONS
   ============================== */

lightboxNext.addEventListener(
    "click",
    (event) => {

        // Prevent click from closing fullscreen
        event.stopPropagation();


        animateLightbox(
            "next"
        );
    }
);


lightboxPrevious.addEventListener(
    "click",
    (event) => {

        // Prevent click from closing fullscreen
        event.stopPropagation();


        animateLightbox(
            "previous"
        );
    }
);


/* ==============================
   FULLSCREEN CLOSE BUTTON
   ============================== */

lightboxClose.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        closeLightbox();
    }
);


/* ==============================
   CLICK BACKGROUND TO CLOSE
   ============================== */

lightbox.addEventListener(
    "click",
    (event) => {

        /*
        Close when clicking either:
        - the dark background
        - empty space inside content
        */

        if (
            event.target ===
                lightbox
            ||
            event.target ===
                lightboxContent
        ) {

            closeLightbox();
        }
    }
);


/* ==============================
   KEYBOARD CONTROLS
   ============================== */

document.addEventListener(
    "keydown",
    (event) => {


        /* ------------------------------
           FULLSCREEN CONTROLS
           ------------------------------ */

        if (lightboxOpen) {


            // Escape closes fullscreen
            if (
                event.key ===
                "Escape"
            ) {

                closeLightbox();

                return;
            }


            // Right arrow = next photo
            if (
                event.key ===
                "ArrowRight"
            ) {

                animateLightbox(
                    "next"
                );

                return;
            }


            // Left arrow = previous photo
            if (
                event.key ===
                "ArrowLeft"
            ) {

                animateLightbox(
                    "previous"
                );

                return;
            }


            return;
        }


        /* ------------------------------
           COLLECTION CONTROLS
           ------------------------------ */

        if (
            event.key ===
                "Escape"
            &&
            collectionViewer
                .classList
                .contains("open")
        ) {

            closeCollection();

            return;
        }


        /* ------------------------------
           NORMAL CAROUSEL CONTROLS
           ------------------------------ */

        if (
            event.key ===
            "ArrowRight"
        ) {

            moveCarouselNext();
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            moveCarouselPrevious();
        }
    }
);


/* ==============================
   INITIALIZE WEBSITE
   ============================== */

updateCarousel();

/* ==============================
   MOBILE CAROUSEL SWIPE
   ============================== */

const swipeCarousel =
    document.querySelector(".carousel");

let touchStartX = 0;
let touchStartY = 0;

let touchEndX = 0;
let touchEndY = 0;

swipeCarousel.addEventListener(
    "touchstart",
    (event) => {
        touchStartX =
            event.changedTouches[0].screenX;

        touchStartY =
            event.changedTouches[0].screenY;
    },
    {
        passive: true
    }
);

swipeCarousel.addEventListener(
    "touchend",
    (event) => {
        touchEndX =
            event.changedTouches[0].screenX;

        touchEndY =
            event.changedTouches[0].screenY;

        const horizontalDistance =
            touchEndX - touchStartX;

        const verticalDistance =
            touchEndY - touchStartY;

        if (
            Math.abs(horizontalDistance) < 50
            ||
            Math.abs(horizontalDistance) <
            Math.abs(verticalDistance)
        ) {
            return;
        }

        if (horizontalDistance < 0) {
            document
                .querySelector(
                    ".carousel-button.next"
                )
                .click();
        }

        else {
            document
                .querySelector(
                    ".carousel-button.previous"
                )
                .click();
        }
    },
    {
        passive: true
    }
);
/* ==============================
   MOBILE LIGHTBOX SWIPE
   ============================== */

let lightboxTouchStartX = 0;
let lightboxTouchStartY = 0;

let lightboxTouchEndX = 0;
let lightboxTouchEndY = 0;

lightbox.addEventListener(
    "touchstart",
    (event) => {
        lightboxTouchStartX =
            event.changedTouches[0].screenX;

        lightboxTouchStartY =
            event.changedTouches[0].screenY;
    },
    {
        passive: true
    }
);

lightbox.addEventListener(
    "touchend",
    (event) => {
        lightboxTouchEndX =
            event.changedTouches[0].screenX;

        lightboxTouchEndY =
            event.changedTouches[0].screenY;

        const horizontalDistance =
            lightboxTouchEndX -
            lightboxTouchStartX;

        const verticalDistance =
            lightboxTouchEndY -
            lightboxTouchStartY;

        if (
            Math.abs(horizontalDistance) < 50
            ||
            Math.abs(horizontalDistance) <
            Math.abs(verticalDistance)
        ) {
            return;
        }

        if (horizontalDistance < 0) {
            document
                .querySelector(
                    ".lightbox-next"
                )
                .click();
        }

        else {
            document
                .querySelector(
                    ".lightbox-previous"
                )
                .click();
        }
    },
    {
        passive: true
    }
);