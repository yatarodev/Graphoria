import { startTransition, useEffect, useState } from "react"
import { useFilePicker } from 'use-file-picker'
import { FaXTwitter } from "react-icons/fa6"
import { FaGithub } from "react-icons/fa"

import { useStore } from "@/app/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { upscaleImage } from "@/app/engine/render"
import { sleep } from "@/lib/sleep"


import { SettingsDialog } from "../settings-dialog"
import { useLocalStorage } from "usehooks-ts"
import { localStorageKeys } from "../settings-dialog/localStorageKeys"
import { defaultSettings } from "../settings-dialog/defaultSettings"
import { FaCopy } from "react-icons/fa"



function BottomBar() {
  const handleCopy = () => {
    navigator.clipboard.writeText("")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
  }

  const isGeneratingStory = useStore(s => s.isGeneratingStory)
  const prompt = useStore(s => s.prompt)
  const panelGenerationStatus = useStore(s => s.panelGenerationStatus)
  const [copied, setCopied] = useState(false)

  const preset = useStore(s => s.preset)
  
  const canSeeBetaFeatures = false // getParam<boolean>("beta", false)

  const allStatus = Object.values(panelGenerationStatus)
  const remainingImages = allStatus.reduce((acc, s) => (acc + (s ? 1 : 0)), 0)

  const currentClap = useStore(s => s.currentClap)
  
  const upscaleQueue = useStore(s => s.upscaleQueue)
  const renderedScenes = useStore(s => s.renderedScenes)
  const removeFromUpscaleQueue = useStore(s => s.removeFromUpscaleQueue)
  const setRendered = useStore(s => s.setRendered)
  const [isUpscaling, setUpscaling] = useState(false)

  const loadClap = useStore(s => s.loadClap)
  const downloadClap = useStore(s => s.downloadClap)

  const [hasGeneratedAtLeastOnce, setHasGeneratedAtLeastOnce] = useLocalStorage<boolean>(
    localStorageKeys.hasGeneratedAtLeastOnce,
    defaultSettings.hasGeneratedAtLeastOnce
  )

  const handleUpscale = () => {
    setUpscaling(true)
    startTransition(() => {
      const fn = async () => {
        for (let [panelId, renderedScene] of Object.entries(upscaleQueue)) {
          try {
            console.log(`upscaling panel ${panelId} (${renderedScene.renderId})`)
            const result = await upscaleImage(renderedScene.assetUrl)
            await sleep(1000)
            if (result.assetUrl) {
              console.log(`upscale successful, removing ${panelId} (${renderedScene.renderId}) from upscale queue`)
              setRendered(panelId, {
                ...renderedScene,
                assetUrl: result.assetUrl
              })
              removeFromUpscaleQueue(panelId)
            }

          } catch (err) {
            console.error(`failed to upscale: ${err}`)
          }
        }
        
        setUpscaling(false)
      }

      fn()
    })
  }

  const handlePrint = () => {
    window.print()
  }
  const hasFinishedGeneratingImages = allStatus.length > 0 && (allStatus.length - remainingImages) === allStatus.length

  // keep track of the first generation, independently of the login status
  useEffect(() => {
    if (hasFinishedGeneratingImages && !hasGeneratedAtLeastOnce) {
      setHasGeneratedAtLeastOnce(true)
    }
  }, [hasFinishedGeneratingImages, hasGeneratedAtLeastOnce])

  const { openFilePicker, filesContent } = useFilePicker({
    accept: '.clap',
    readAs: "ArrayBuffer"
  })
  const fileData = filesContent[0]

  useEffect(() => {
    const fn = async () => {
      if (fileData?.name) {
        try {
          const blob = new Blob([fileData.content])
          await loadClap(blob)
        } catch (err) {
          console.error("failed to load the Clap file:", err)
        }
      }
    }
    fn()
  }, [fileData?.name])


  return (
    <div className={cn(
      `print:hidden`,
      `fixed bottom-2 md:bottom-4 left-2 right-0 md:left-3 md:right-1`,
      `flex flex-row`,
      `justify-between`,
      `pointer-events-none`
    )}>
      <div className={cn(
        `flex flex-row`,
        `items-end`,
        `pointer-events-auto`,
        `animation-all duration-300 ease-in-out`,
        isGeneratingStory ? `scale-0 opacity-0` : ``,
        `space-x-3`
      )}>
        {/* <About /> */}
        {/* <Discord /> */}
        {/* <Advert /> */}
      </div>
      <div className={cn(
        `flex flex-row`,
        `pointer-events-auto`,
        `animation-all duration-300 ease-in-out`,
        isGeneratingStory ? `scale-0 opacity-0` : ``,
        `space-x-3`
      )}>
      <Button
  variant="outline"
  className={cn(
    "bg-white hover:bg-gray-50 space-x-2",
    "transition-all duration-200",
    copied && "bg-green-50"
  )}
  onClick={handleCopy}
  aria-label="Copy Graphica ID"
  title="Copy Graphica ID to clipboard"
>
  <FaCopy className={cn(
    "w-4 h-4",
    "transition-transform duration-200",
    copied && "scale-110"
  )} />
  <span className="hidden md:inline">
    {copied ? "Copied!" : ""}
  </span>
  <span className="inline md:hidden">
    {copied ? "Copied!" : "Copy ID"}
  </span>
</Button>
          {canSeeBetaFeatures ? <Button
            onClick={openFilePicker}
            disabled={remainingImages > 0}
          >Load</Button> : null}
          {canSeeBetaFeatures ? <Button
            onClick={downloadClap}
            disabled={remainingImages > 0}
          >
          {remainingImages ? `${allStatus.length - remainingImages}/${allStatus.length} ⌛` : `Save`}
        </Button> : null}
     
          <Button
            variant="outline"
            className="bg-black hover:bg-gray-900 text-white space-x-2"
            onClick={() => window.open("https://x.com/graphicaai", "_blank")}
          >
            <FaXTwitter className="w-4 h-4" />
            <span className="hidden md:inline">Graphica</span>
          </Button>

          <Button
            variant="outline" 
            className="bg-white hover:bg-gray-50 space-x-2"
            onClick={() => window.open("https://pump.fun/", "_blank")}
          >
            <img src="/pump.png" className="w-4 h-4" alt="Pump" />
            <span className="hidden md:inline">Pump</span>
          </Button>

          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 space-x-2"
            onClick={() => window.open("https://github.com/alexthedevv/graphica", "_blank")}
          >
            <FaGithub className="w-4 h-4" />
            <span className="hidden md:inline">GitHub</span>
          </Button>

          <Button
            onClick={handlePrint}
            disabled={!prompt?.length}
          >
            <span className="hidden md:inline">{
              remainingImages ? `${allStatus.length - remainingImages}/${allStatus.length} panels ⌛` : `Get PDF`
            }</span>
            <span className="inline md:hidden">{
              remainingImages ? `${allStatus.length - remainingImages}/${allStatus.length} ⌛` : `PDF`
            }</span>
          </Button>
  
       {/* <Share /> */}
      </div>
    </div>
  )
}

export default BottomBar