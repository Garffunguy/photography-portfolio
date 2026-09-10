# =============================================
# PHOTOGRAPHY WEBSITE - PHOTO LIST GENERATOR
# =============================================

$projectFolder = $PSScriptRoot

$carouselFolder =
    Join-Path $projectFolder "Images\Carousel"

$collectionsFolder =
    Join-Path $projectFolder "Images\Collections"

$outputFile =
    Join-Path $projectFolder "photos.js"

$exifTool =
    Join-Path $projectFolder "exiftool.exe"


# File types the website should recognize
$imageExtensions = @(
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
)


# =============================================
# CHECK EXIFTOOL
# =============================================

if (-not (Test-Path $exifTool)) {

    Write-Host ""
    Write-Host "ERROR: exiftool.exe was not found."
    Write-Host ""
    Write-Host "Expected location:"
    Write-Host $exifTool
    Write-Host ""

    exit
}


# =============================================
# READ PHOTO METADATA
# =============================================

function Get-PhotoMetadata {

    param (
        [string]$FilePath
    )


    try {

        $metadataJson =
            & $exifTool `
                -q `
                -q `
                -j `
                -Model `
                -FocalLength `
                -FNumber `
                -ExposureTime `
                -ISO `
                -- `
                $FilePath |
            Out-String


        $metadataArray =
            $metadataJson |
            ConvertFrom-Json


        if ($null -eq $metadataArray) {
            return $null
        }


        $metadata = $metadataArray[0]


        $result =
            [ordered]@{}


        # Camera
if ($metadata.Model) {

    $cameraModel =
        [string]$metadata.Model

    # Some files store "EOS R10"
    # instead of "Canon EOS R10"
    if ($cameraModel -match "^EOS ") {

        $cameraModel =
            "Canon $cameraModel"
    }

    $result.camera =
        $cameraModel
}


        # Focal Length
        if ($metadata.FocalLength) {

            $result.focal =
                [string]$metadata.FocalLength
        }


        # Aperture
        if ($metadata.FNumber) {

            $result.aperture =
                "f/$($metadata.FNumber)"
        }


        # Shutter Speed
        if ($metadata.ExposureTime) {

            $result.shutter =
                [string]$metadata.ExposureTime
        }


        # ISO
        if ($metadata.ISO) {

            $result.iso =
                [string]$metadata.ISO
        }


        return $result
    }

    catch {

        Write-Host "Could not read EXIF:"
        Write-Host $FilePath
        Write-Host ""

        return $null
    }
}


# =============================================
# FEATURED PHOTOGRAPHS
# =============================================

$featuredFiles =
    Get-ChildItem $carouselFolder -File |
    Where-Object {
        $imageExtensions -contains $_.Extension.ToLower()
    } |
    Sort-Object Name


$featuredPhotos = @()


foreach ($file in $featuredFiles) {

    Write-Host "Reading Featured:" $file.Name


    $photo =
        [ordered]@{
            file = $file.Name
        }


    $metadata =
        Get-PhotoMetadata $file.FullName


    if ($metadata) {

        foreach ($property in $metadata.Keys) {

            $photo[$property] =
                $metadata[$property]
        }
    }


    $featuredPhotos +=
        [pscustomobject]$photo
}


# =============================================
# COLLECTIONS
# =============================================

$collections = @()

$photoMetadata =
    [ordered]@{}


$collectionFolders =
    Get-ChildItem $collectionsFolder -Directory |
    Sort-Object Name


foreach ($folder in $collectionFolders) {

    # Default display name is the folder name
    $displayName = $folder.Name


    # Custom names for folders whose display names differ
    if ($folder.Name -eq "Virtual") {

        $displayName =
            "Virtual Photography"
    }


    # Find photographs inside the collection
    $photos =
        Get-ChildItem $folder.FullName -File |
        Where-Object {
            $imageExtensions -contains $_.Extension.ToLower()
        } |
        Sort-Object Name


    $photoNames = @()


    foreach ($photoFile in $photos) {

        Write-Host `
            "Reading $displayName :" `
            $photoFile.Name


        # Keep collection photo lists as filenames for compatibility
        $photoNames +=
            $photoFile.Name


        # Read metadata for this photograph
        $metadata =
            Get-PhotoMetadata $photoFile.FullName


        if (
            $metadata -and
            $metadata.Count -gt 0
        ) {

            # Example key:
            # Liminality/cover.jpg

            $metadataKey =
                "$($folder.Name)/$($photoFile.Name)"


            $photoMetadata[$metadataKey] =
                [pscustomobject]$metadata
        }
    }


    $collection =
        [ordered]@{
            name   = $displayName
            folder = $folder.Name
            cover  = "cover.jpg"
            photos = $photoNames
        }


    $collections +=
        [pscustomobject]$collection
}


# =============================================
# CONVERT DATA TO JSON
# =============================================

$featuredJson =
    ConvertTo-Json `
        -InputObject @($featuredPhotos) `
        -Depth 10


$collectionsJson =
    ConvertTo-Json `
        -InputObject @($collections) `
        -Depth 10


$metadataJson =
    ConvertTo-Json `
        -InputObject $photoMetadata `
        -Depth 10


# =============================================
# BUILD PHOTOS.JS
# =============================================

$output = @"
/* =============================================
   AUTO-GENERATED PHOTO LIST

   Do not manually edit this file.
   Run generate-photos.ps1 after changing folders.
   ============================================= */


/* ==============================
   FEATURED PHOTOGRAPHS
   ============================== */

const featuredPhotos = $featuredJson;


/* ==============================
   COLLECTIONS
   ============================== */

const collections = $collectionsJson;


/* ==============================
   PHOTO METADATA

   Technical EXIF information for
   photographs inside collections.
   ============================== */

const photoMetadata = $metadataJson;
"@


Set-Content `
    -Path $outputFile `
    -Value $output `
    -Encoding UTF8


# =============================================
# FINISHED
# =============================================

Write-Host ""
Write-Host "Photo list updated successfully."
Write-Host ""
Write-Host "Featured photos:" $featuredFiles.Count
Write-Host "Collections:" $collectionFolders.Count
Write-Host "Photos with EXIF:" $photoMetadata.Count
Write-Host ""