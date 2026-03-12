import axios from "axios"

const SERPER_KEY = process.env.SERPER_API_KEY

export async function webSearch(query) {
  try {
    if (!SERPER_KEY) {
      console.log("SERPER_API_KEY não configurada.")
      return ""
    }

    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: query },
      {
        headers: {
          "X-API-KEY": SERPER_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    )

    const results = response.data?.organic || []

    if (!results.length) return ""

    const topResults = results.slice(0, 5)

    return topResults
      .map(
        r =>
          `Título: ${r.title || "Sem título"}\nResumo: ${r.snippet || "Sem resumo"}\nFonte: ${r.link || "Sem link"}`
      )
      .join("\n\n")
  } catch (error) {
    console.log("Erro webSearch:", error.message)
    return ""
  }
}

export async function getExchangeRate(base = "USD", target = "BRL") {
  try {
    const response = await axios.get(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(target)}`,
      { timeout: 10000 }
    )

    const rate = response.data?.rates?.[target]

    if (!rate) return ""

    return `Cotação atual aproximada: 1 ${base} = ${rate} ${target}`
  } catch (error) {
    console.log("Erro getExchangeRate:", error.message)
    return ""
  }
}

export async function getCryptoPrice(coin = "bitcoin") {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: coin,
          vs_currencies: "usd,brl"
        },
        timeout: 10000
      }
    )

    const data = response.data?.[coin]

    if (!data) return ""

    const usd = data.usd
    const brl = data.brl

    return `Preço atual de ${coin}: US$ ${usd} | R$ ${brl}`
  } catch (error) {
    console.log("Erro getCryptoPrice:", error.message)
    return ""
  }
}

export async function getWeather(city = "Rio de Janeiro") {
  try {
    const response = await axios.get(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { timeout: 10000 }
    )

    const current = response.data?.current_condition?.[0]

    if (!current) return ""

    const description = current.weatherDesc?.[0]?.value || "Sem descrição"

    return `Clima atual em ${city}: temperatura de ${current.temp_C}°C, sensação térmica de ${current.FeelsLikeC}°C, condição "${description}", umidade de ${current.humidity}% e vento de ${current.windspeedKmph} km/h.`
  } catch (error) {
    console.log("Erro getWeather:", error.message)
    return ""
  }
}
