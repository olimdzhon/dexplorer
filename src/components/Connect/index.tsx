import { FormEvent, ChangeEvent, useState } from 'react'
import {
  Stack,
  FormControl,
  Input,
  Button,
  useColorModeValue,
  Heading,
  Text,
  Container,
  Flex,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import Head from 'next/head'
import { Tendermint34Client, WebsocketClient } from '@cosmjs/tendermint-rpc'
import { replaceHTTPtoWebsocket } from '@/utils/helper'

export default function Connect() {
  const [address, setAddress] = useState('')
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [error, setError] = useState(false)
  const dispatch = useDispatch()

  const connectClient = async (e: FormEvent) => {
    e.preventDefault()
    setError(false)
    setState('submitting')

    if (!address) {
      setError(true)
      setState('initial')
      return
    }

    const wsClient = new WebsocketClient(replaceHTTPtoWebsocket(address))
    const tmClient = await Tendermint34Client.create(wsClient).catch((err) => {
      console.error(err)
    })

    if (!tmClient) {
      setError(true)
      setState('initial')
      return
    }

    dispatch(setConnectState(true))
    dispatch(setTmClient(tmClient))
    dispatch(setRPCAddress(address))
    setState('success')

    window.localStorage.setItem('RPC_ADDRESS', address)
  }

  return (
    <>
      <Head>
        <title>Connect to RPC Address</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.100', 'gray.900')}
      >
        <Container
          maxW={'lg'}
          bg={useColorModeValue('white', 'whiteAlpha.100')}
          boxShadow={'xl'}
          rounded={'lg'}
          p={6}
        >
          <Heading
            as={'h2'}
            fontSize={{ base: 'xl', sm: '2xl' }}
            textAlign={'center'}
            mb={5}
          >
            Connect to RPC Address
          </Heading>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            as={'form'}
            spacing={'12px'}
            onSubmit={connectClient}
          >
            <FormControl>
              <Input
                variant={'solid'}
                borderWidth={1}
                color={'gray.800'}
                _placeholder={{
                  color: 'gray.400',
                }}
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                id={'address'}
                type={'url'}
                required
                placeholder={'RPC Address'}
                aria-label={'RPC Address'}
                value={address}
                disabled={state !== 'initial'}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
              />
            </FormControl>
            <FormControl w={{ base: '100%', md: '40%' }}>
              <Button
                colorScheme={state === 'success' ? 'green' : 'blue'}
                isLoading={state === 'submitting'}
                w="100%"
                type={state === 'success' ? 'button' : 'submit'}
              >
                {state === 'success' ? <CheckIcon /> : 'Connect'}
              </Button>
            </FormControl>
          </Stack>
          <Text
            mt={2}
            textAlign={'center'}
            color={error ? 'red.500' : 'gray.500'}
          >
            {error
              ? 'Oh no an error occured! 😢 Please try again later.'
              : 'For any Cosmos SDK chain! ✌️'}
          </Text>
        </Container>
      </Flex>
    </>
  )
}
