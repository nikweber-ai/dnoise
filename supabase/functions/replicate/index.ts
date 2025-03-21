
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const body = await req.json()
    const { 
      prompt, 
      negativePrompt, 
      width, 
      height, 
      seed, 
      model, 
      numOutputs, 
      aspectRatio, 
      modelVersion, 
      loraWeights, 
      loraScale, 
      apiKey 
    } = body

    // Check if user's personal API key is provided
    if (!apiKey) {
      throw new Error('You must provide your personal Replicate API key in your profile settings.')
    }

    // Basic validation
    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: prompt" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("Generating images with Replicate. Prompt:", prompt)
    
    // Determine which Replicate model to use based on model params
    const modelId = "black-forest-labs/flux-dev-lora" // Default model
    
    // Prepare API input
    const input = {
      prompt: prompt,
      negative_prompt: negativePrompt || "",
      width: width || 1024,
      height: height || 1024,
      seed: seed !== undefined ? seed : Math.floor(Math.random() * 1000000),
      num_outputs: numOutputs || 1,
      lora_weights: loraWeights || "",
      lora_scale: loraScale || 1,
      aspect_ratio: aspectRatio || "1:1",
      output_format: "webp",
      output_quality: 80,
      num_inference_steps: 28,
      go_fast: true,
      megapixels: "1",
      disable_safety_checker: false,
    }

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: modelVersion || "5a5dd543d3b53c4bc7fd7ebdd933d839fbda221dbc4b7b122b9c2b7a7c3cf84d",
        input: input
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Replicate API error:", error)
      
      // Handle specific error cases
      let errorMessage = "Image generation failed"
      if (error.detail?.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later."
      } else if (error.detail?.includes("invalid token")) {
        errorMessage = "Invalid API token. Please check your Replicate API key."
      } else if (error.detail) {
        errorMessage = error.detail
      }
      
      throw new Error(errorMessage)
    }

    const prediction = await response.json()
    console.log("Prediction created:", prediction.id)

    // Check prediction status and wait for completion
    let completed = false
    let resultData = null
    let attempts = 0
    const maxAttempts = 30

    while (!completed && attempts < maxAttempts) {
      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json"
        }
      })

      if (!statusResponse.ok) {
        console.error("Status check failed")
        continue
      }

      const statusData = await statusResponse.json()
      console.log(`Status check ${attempts}:`, statusData.status)

      if (statusData.status === "succeeded") {
        completed = true
        resultData = statusData
      } else if (statusData.status === "failed") {
        throw new Error(`Generation failed: ${statusData.error || "Unknown error"}`)
      }
    }

    if (!completed) {
      throw new Error("Generation timed out")
    }

    // Prepare the results
    const results = []
    if (resultData && resultData.output) {
      if (Array.isArray(resultData.output)) {
        for (const url of resultData.output) {
          results.push({
            url,
            seed: input.seed,
            prompt: input.prompt,
            negativePrompt: input.negative_prompt,
            width: input.width,
            height: input.height,
            model: model
          })
        }
      } else if (typeof resultData.output === 'string') {
        results.push({
          url: resultData.output,
          seed: input.seed,
          prompt: input.prompt,
          negativePrompt: input.negative_prompt,
          width: input.width,
          height: input.height,
          model: model
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in Replicate function:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
