const express = require( 'express' )
const axios = require( 'axios' )
const app = express()
const port = process.env.PORT || 3000

app.get( '/', ( req, res ) => {
  res.send( 'Hello World!' )
} )

const addDao = ( prev, current, idx, arr ) => {
  return prev + current
}

app.get( '/api/organizations/all', async ( req, res ) => {
  const allOrgs = await ( await axios.get( "https://backend.deepdao.io/dashboard/organizations/" ) ).data
  const allDAOs = await ( await axios.get( "https://backend.deepdao.io/dashboard/ksdf3ksa-937slj3/" ) ).data.daosSummary.reduce( ( a, v ) => ( { ...a, [ v.organizationId ]: v } ) )
  const orgs = allOrgs.reduce( ( filteredDaos, org ) => {
    if ( allDAOs[ org.id ]?.daoId ) {
      const formattedOrg = {
        orgId: org.id,
        daoId: allDAOs[ org.id ].daoId,
        daoName: allDAOs[ org.id ].daoName,
        logo: ( !allDAOs[ org.id ].logo )
          ? "https://www.logo.wine/a/logo/Ethereum/Ethereum-Logo.wine.svg"
          : ( allDAOs[ org.id ].logo?.indexOf( "http" ) >= 0 )
            ? allDAOs[ org.id ].logo
            : "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/" + allDAOs[ org.id ].logo,
      }
      filteredDaos.push( formattedOrg )
    }
    return filteredDaos
  }, [] )
  res.send( orgs )
} )

app.get( '/api/daos/all', async ( req, res ) => {
  const allDAOs = await ( await axios.get( "https://backend.deepdao.io/dashboard/ksdf3ksa-937slj3/" ) ).data
  const DAOs = allDAOs.daosSummary.reduce( ( filteredDaos, dao ) => {
    if ( dao.logo && dao.logo !== null ) {
      const formattedDao = {
        orgId: dao.organizationId,
        daoId: dao.daoId,
        name: dao.daoName,
        logo: ( dao.logo.indexOf( "http" ) >= 0 )
          ? dao.logo
          : "https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/" + dao.logo,
      }
      filteredDaos.push( formattedDao )
    }
    return filteredDaos
  }, [] )
  res.send( DAOs )
} )

app.get( '/api/daos/:ID', async ( req, res ) => {
  const daoId = req.params.ID

  const dao = await ( await axios.get( `https://backend.deepdao.io/dao/ksdf3ksa-937slj3/${ daoId }` ) ).data
  const formattedDao = {
    daoId: dao.daoId,
    chainId: dao.chainId,
    name: dao.name,
    description: dao.description,
    platform: dao.platform,
    mainAccount: dao.mainAccount,
    molochGuildBank: dao.molochGuildBank,
    aragonEns: dao.aragonEns,
    platformNativeLink: dao.platformNativeLink,
    mainSiteLink: dao.mainSiteLink,
    thumbName: dao.thumbName,
    twitter: dao.twitter,
    telegram: dao.telegram,
    discord: dao.discord,
    github: dao.github,
    createdAt: dao.createdAt,
    isActive: dao.isActive,
    organizationId: dao.organizationId,
    snapshotLink: dao.snapshotLink,
    rankings: JSON.parse( dao.rankings ),
    indices: JSON.parse( dao.indices ),
    proposals: JSON.parse( dao.proposals ),
    members: JSON.parse( dao.members ),
    votersCoalition: JSON.parse( dao.votersCoalition ),
    financial: JSON.parse( dao.financial ),
    isDisplayed: dao.isDisplayed,
  }

  res.send( formattedDao )
} )

app.get( '/api/daos/:ID/tokens', async ( req, res ) => {
  const daoId = req.params.ID

  const tokens = JSON.parse( await ( await axios.get( `https://backend.deepdao.io/dao/ksdf3ksa-937slj3/${ daoId }` ) ).data.financial ).tokens
  const formattedTokens = tokens.map( token => ( {
    tokenName: token.tokenName,
    tokenSymbol: token.tokenSymbol,
    tokenAddress: token.tokenAddress,
  } ) )

  res.send( formattedTokens )
} )

app.listen( port, () => {
  console.log( `Prime Deals Server. Listening at http://localhost:${ port }` )
} )