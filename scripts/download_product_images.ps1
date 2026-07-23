param(
    [string]$Destination = "backend/media/products/catalog"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $Destination))

if (-not $destinationPath.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "La carpeta de destino debe estar dentro del proyecto."
}

New-Item -ItemType Directory -Force -Path $destinationPath | Out-Null

$images = @(
    @{ File = "dell-latitude-7490.jpg"; Url = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/latitude-notebooks/14-7490/touch/notebooks-latitude-14-7490t-relsize-500-ng.psd?fmt=jpg&wid=900" },
    @{ File = "dell-latitude-5430.jpg"; Url = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/latitude-notebooks/14-5430/spi/ng/notebook-latitude-14-5430-nt-black-relsize-500-ng.psd?fmt=jpg&wid=900" },
    @{ File = "dell-latitude-e7470.jpg"; Url = "https://tuanphong.vn/pictures/thumb/2020/01/1579001730-357-laptop-dell-latitude-e7470-1-420x420.jpg" },
    @{ File = "dell-latitude-3420.jpg"; Url = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/latitude-notebooks/14-3420/global-spi/ng/notebook-latitude-14-3420-nt-relsize-500-ng.psd?fmt=jpg&wid=900" },
    @{ File = "dell-latitude-3520.jpg"; Url = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/latitude-notebooks/15-3520/global-spi/ng/notebook-latitude-15-3520-nt-relsize-500-ng.psd?fmt=jpg&wid=900" },
    @{ File = "dell-inspiron-3501.jpg"; Url = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/inspiron-notebooks/inspiron-3501/global-spi/ng/notebook-inspiron-15-3501-nt-relsize-500-ng.psd?fmt=jpg&wid=900" },
    @{ File = "dell-latitude-3510.jpg"; Url = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/latitude-notebooks/15-3510/global-spi/ng/notebook-latitude-15-3510-nt-gray-l-relsize-500-ng.psd?fmt=jpg&wid=900" },
    @{ File = "lenovo-thinkpad-t480.jpg"; Url = "https://download.lenovo.com/images/ProdImageLaptops/thinkpad_t480.jpg" },
    @{ File = "lenovo-yoga-520.jpg"; Url = "https://download.lenovo.com/images/ProdImageLaptops/yoga_520.jpg" },
    @{ File = "lenovo-thinkcentre-m820z.jpg"; Url = "https://download.lenovo.com/images/ProdImageDesktops/m910z.jpg" },
    @{ File = "lenovo-thinkcentre-m920z.jpg"; Url = "https://download.lenovo.com/images/ProdImageDesktops/m910z_thinkcentre.jpg" },
    @{ File = "lenovo-thinkcentre-m80q.jpg"; Url = "https://p3-ofp.static.pub/fes/cms/2021/07/15/l065gtoe0dc8hk4ug4bp0z9xpf2qgb384076.jpg?width=900&height=900" },
    @{ File = "hp-proone-400-g4.png"; Url = "https://cl-media.hptiendaenlinea.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/5/D/5DV76LA-1_T1679645094.png" },
    @{ File = "hp-200-g3.jpg"; Url = "https://deus.com.gh/media/catalog/product/cache/0fd4067eec299be81c60e324b54af6f0/2/2/2251_200g3_.jpg" },
    @{ File = "hp-24-f0xx.png"; Url = "https://www.protechintl.com.au/cdn/shop/files/333.png?v=1733381078&width=900" },
    @{ File = "hp-250-g8.jpg"; Url = "https://gomagcdn.ro/domains/shop.one-it.ro/files/product/large/hp-250-g8-15-6-i3-1005g1-8-256-uma-w10p-27j88ea-41569-2017789556.jpg" },
    @{ File = "acer-aspire-a315-56.jpg"; Url = "https://www.perennial.com.bd/image/cache/catalog/laptop/acer/b-500x500.jpg" }
)

foreach ($image in $images) {
    $outputPath = Join-Path $destinationPath $image.File
    Invoke-WebRequest -Uri $image.Url -OutFile $outputPath -UseBasicParsing -TimeoutSec 60
    Write-Output "Descargada: $($image.File)"
}
