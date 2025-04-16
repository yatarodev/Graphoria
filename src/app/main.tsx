"use client"

import { Suspense, useEffect, useRef, useState, useTransition } from "react"
import { useLocalStorage } from "usehooks-ts"

import { cn } from "@/lib/utils"
import { fonts } from "@/lib/fonts"
import { GeneratedPanel } from "@/types"
import { joinWords } from "@/lib/joinWords"
import { useDynamicConfig } from "@/lib/useDynamicConfig"
import { Button } from "@/components/ui/button"

import { TopMenu } from "./interface/top-menu"
import { useStore } from "./store"
import { Zoom } from "./interface/zoom"
import { BottomBar } from "./interface/bottom-bar"
import { Page } from "./interface/page"
import { getStoryContinuation } from "./queries/getStoryContinuation"
import { localStorageKeys } from "./interface/settings-dialog/localStorageKeys"
import { defaultSettings } from "./interface/settings-dialog/defaultSettings"
import { useLLMVendorConfig } from "@/lib/useLLMVendorConfig"

export default function Main() {
  const [_isPending, startTransition] = useTransition()

  const llmVendorConfig = useLLMVendorConfig()
  const { config, isConfigReady } = useDynamicConfig()
  const isGeneratingStory = useStore(s => s.isGeneratingStory)
  const setGeneratingStory = useStore(s => s.setGeneratingStory)

  const font = useStore(s => s.font)
  const preset = useStore(s => s.preset)
  const prompt = useStore(s => s.prompt)

  const currentNbPages = useStore(s => s.currentNbPages)
  const maxNbPages = useStore(s => s.maxNbPages)
  const previousNbPanels = useStore(s => s.previousNbPanels)
  const currentNbPanels = useStore(s => s.currentNbPanels)
  const maxNbPanels = useStore(s => s.maxNbPanels)

  const setCurrentNbPanelsPerPage = useStore(s => s.setCurrentNbPanelsPerPage)
  const setMaxNbPanelsPerPage = useStore(s => s.setMaxNbPanelsPerPage)
  const setCurrentNbPages = useStore(s => s.setCurrentNbPages)
  const setMaxNbPages = useStore(s => s.setMaxNbPages)

  const panels = useStore(s => s.panels)
  const setPanels = useStore(s => s.setPanels)

  // do we need those?
  const renderedScenes = useStore(s => s.renderedScenes)

  const speeches = useStore(s => s.speeches)
  const setSpeeches = useStore(s => s.setSpeeches)

  const captions = useStore(s => s.captions)
  const setCaptions = useStore(s => s.setCaptions)

  const zoomLevel = useStore(s => s.zoomLevel)

  const [waitABitMore, setWaitABitMore] = useState(false)

  const [userDefinedMaxNumberOfPages, setUserDefinedMaxNumberOfPages] = useLocalStorage<number>(
    localStorageKeys.userDefinedMaxNumberOfPages,
    defaultSettings.userDefinedMaxNumberOfPages
  )
  
  const numberOfPanels = Object.keys(panels).length
  const panelGenerationStatus = useStore(s => s.panelGenerationStatus)
  const allStatus = Object.values(panelGenerationStatus)
  const numberOfPendingGenerations = allStatus.reduce((acc, s) => (acc + (s ? 1 : 0)), 0)

  const hasAtLeastOnePage = numberOfPanels > 0

  const hasNoPendingGeneration =
    numberOfPendingGenerations === 0

  const hasStillMorePagesToGenerate =
    currentNbPages < maxNbPages

  const showNextPageButton =
    hasAtLeastOnePage &&
    hasNoPendingGeneration

  useEffect(() => {
    if (maxNbPages !== userDefinedMaxNumberOfPages) {
      setMaxNbPages(userDefinedMaxNumberOfPages)
    }
  }, [maxNbPages, userDefinedMaxNumberOfPages])


  const ref = useRef({
    existingPanels: [] as GeneratedPanel[],
    newPanelsPrompts: [] as string[],
    newSpeeches: [] as string[],
    newCaptions: [] as string[],
    prompt: "",
    preset: "",
  })

  useEffect(() => {
    if (isConfigReady) {
      setCurrentNbPanelsPerPage(config.nbPanelsPerPage)
      setMaxNbPanelsPerPage(config.nbPanelsPerPage)
    }
  }, [JSON.stringify(config), isConfigReady])

  useEffect(() => {
    if (!prompt) { return }

    if (
      prompt === useStore.getState().currentClap?.meta.description
    ) {
      console.log(`loading a pre-generated comic, so skipping prompt regeneration..`)
      return
    }

    if (
      prompt !== ref.current.prompt || 
      preset?.label !== ref.current.preset) {
      ref.current = {
        existingPanels: [],
        newPanelsPrompts: [],
        newSpeeches: [],
        newCaptions: [],
        prompt,
        preset: preset?.label || "",
      }
    }

    startTransition(async () => {
      setWaitABitMore(false)
      setGeneratingStory(true)

      const [stylePrompt, userStoryPrompt] = prompt.split("||").map(x => x.trim())

      let limitedStylePrompt = stylePrompt.trim().slice(0, 77).trim()
      if (limitedStylePrompt.length !== stylePrompt.length) {
        console.log("Sorry folks, the style prompt was cut to:", limitedStylePrompt)
      }
    
      const lightPanelPromptPrefix: string = joinWords(preset.imagePrompt(limitedStylePrompt))
    
      const degradedPanelPromptPrefix: string = joinWords([
        ...preset.imagePrompt(limitedStylePrompt),
        userStoryPrompt
      ])

      const nbPanelsToGenerate = 2
      for (
        let currentPanel = previousNbPanels;
        currentPanel < currentNbPanels;
        currentPanel += nbPanelsToGenerate
      ) {
        try {
          const candidatePanels = await getStoryContinuation({
            preset,
            stylePrompt,
            userStoryPrompt,
            nbPanelsToGenerate,
            maxNbPanels,
            existingPanels: ref.current.existingPanels,

            llmVendorConfig,
          })

          ref.current.existingPanels.push(...candidatePanels)
         
          const startAt = currentPanel
          const endAt = currentPanel + nbPanelsToGenerate
          for (let p = startAt; p < endAt; p++) {
            ref.current.newCaptions.push(ref.current.existingPanels[p]?.caption.trim() || "...")
            ref.current.newSpeeches.push(ref.current.existingPanels[p]?.speech.trim() || "...")
            const newPanel = joinWords([
              ref.current.existingPanels[p]?.instructions
              ? lightPanelPromptPrefix
              : degradedPanelPromptPrefix,
    
              ref.current.existingPanels[p]?.instructions || ""
            ])
            ref.current.newPanelsPrompts.push(newPanel)

          }
          setSpeeches(ref.current.newSpeeches)
          setCaptions(ref.current.newCaptions)
          setPanels(ref.current.newPanelsPrompts)
          setGeneratingStory(false)          
        } catch (err) {
          setGeneratingStory(false)
          break
        }

      }
  
 
    })
  }, [
    prompt,
    preset?.label,
    previousNbPanels,
    currentNbPanels,
    maxNbPanels
  ]) 

  return (
    <Suspense>
      <TopMenu />
      <div className={cn(
        `flex items-start w-screen h-screen pt-24 md:pt-[72px] overflow-y-scroll`,
        `transition-all duration-200 ease-in-out`,
        zoomLevel > 105 ? `px-0` : `pl-1 pr-8 md:pl-16 md:pr-16`,

        // important: in "print" mode we need to allow going out of the screen
        `print:pt-0 print:px-0 print:pl-0 print:pr-0 print:h-auto print:w-auto print:overflow-visible`,

        fonts.actionman.className
      )}>
        <div
          className={cn(
            `flex flex-col w-full`,
            zoomLevel > 105 ? `items-start` : `items-center`
          )}>
          <div
            className={cn(
              `comic-page`,

              `grid grid-cols-1`,
              currentNbPages > 1 ? `md:grid-cols-2` : ``,

              // spaces between pages
              `gap-x-3 gap-y-4 md:gap-x-8 lg:gap-x-12 xl:gap-x-16`,

              // when printed
              `print:gap-x-3 print:gap-y-4 print:grid-cols-1`,
            )}
            style={{
              width: `${zoomLevel}%`
            }}>
            {Array(currentNbPages).fill(0).map((_, i) => <Page key={i} page={i} />)}
          </div>
          {
          showNextPageButton &&
            <div className={cn(
              `flex flex-col space-y-2 pt-2 pb-6 text-gray-600 dark:text-gray-600`,
              `print:hidden`
            )}>
              <div>Happy with your story?</div>
              <div>You can <Button onClick={() => {
                setCurrentNbPages(currentNbPages + 1)
                if (currentNbPages + 1 >= maxNbPages) {
                  setMaxNbPages(maxNbPages + 1)
                }
              }}>Add page {currentNbPages + 1} 👀</Button></div>
            </div>
          }
        </div>
      </div>
      <Zoom />
      <BottomBar />
      <div className={cn(
        `print:hidden`,
        `z-20 fixed inset-0`,
        `flex flex-row items-center justify-center`,
        `transition-all duration-300 ease-in-out`,
        isGeneratingStory
          ? `bg-zinc-50/30 backdrop-blur-md`
          : `bg-zinc-50/0 backdrop-blur-none pointer-events-none`,
        fonts.actionman.className
      )}>
        <div className={cn(
          `text-center text-xl text-stone-700 w-[70%]`,
          isGeneratingStory ? ``: `scale-0 opacity-0`,
          `transition-all duration-300 ease-in-out`,
        )}>
          {waitABitMore ? `Story is ready, but server is a bit busy!`: 'Generating a new story..'}<br/>
          {waitABitMore ? `Please hold tight..` : ''}
        </div>
      </div>
    </Suspense>
  )
}