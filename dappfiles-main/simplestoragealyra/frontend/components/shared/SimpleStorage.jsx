'use client';
import { useState, useEffect } from "react";

import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { RocketIcon } from "@radix-ui/react-icons"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { contractAddress, contractAbi } from "@/constants";

import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { parseAbiItem } from "viem";

import { publicClient } from "@/utils/client";

import Event from "./Event";

const SimpleStorage = () => {

  const { address } = useAccount();

  const [number, setNumber] = useState(null);
  const [events, setEvents] = useState([])

  const { toast } = useToast()

  const { data: numberGet, error: getError, isPending: getIsPending, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'retrieve',
    account: address
  })

  const { data: hash, error, isPending: setIsPending, writeContract } = useWriteContract({
    mutation: {
      // onSuccess: () => {

      // },
      // onError: (error) => {

      // }
    }
  })

  const setTheNumber = async() => {
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'store',
      args: [number]
    })
  }

  const { isLoading: isConfirming, isSuccess, error: errorConfirmation } = useWaitForTransactionReceipt({
    hash
  })

  const refetchEverything = async() => {
    await refetch();
    await getEvents();
  }

  const getEvents = async() => {
    // On récupère tous les events NumberChanged
    const numberChangedLog = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem('event NumberChanged(uint oldValue, uint newValue)'),
        // du premier bloc
        fromBlock: 0n,
        // jusqu'au dernier
        toBlock: 'latest' // Pas besoin valeur par défaut
    })
    // Et on met ces events dans le state "events" en formant un objet cohérent pour chaque event
    setEvents(numberChangedLog.map(
        log => ({
            oldValue: log.args.oldValue.toString(),
            newValue: log.args.newValue.toString()
        })
    ))
  }

  useEffect(() => {
    if(isSuccess) {
      toast({
        title: "Félicitations",
        description: "Votre nombre a été inscrit dans la Blockchain",
        className: "bg-lime-200"
      })
      refetchEverything();
    }
    if(errorConfirmation) {
      toast({
          title: errorConfirmation.message,
          status: "error",
          duration: 3000,
          isClosable: true,
      });
    }
  }, [isSuccess, errorConfirmation])

  // Lorsque l'on a qqn qui est connecté, on fetch les events
  useEffect(() => {
      const getAllEvents = async() => {
          if(address !== 'undefined') {
            await getEvents();
          }
      }
      getAllEvents()
  }, [address])

  return (
    <div className="flex flex-col w-full">
      <h2 className="mb-4 text-4xl">Get</h2>
      <div>
        {getIsPending ? (
          <div>Chargement...</div>
        ) : (
          <p>The number in the Blockchain : <span className="font-bold">{numberGet?.toString()}</span></p>
        )}
      </div>
      <h2 className="mt-6 mb-4 text-4xl">Set</h2>
      <div className="flex flex-col w-full">
        {hash &&
          <Alert className="mb-4 bg-lime-200">
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
                Transaction Hash: {hash}
            </AlertDescription>
        </Alert>
        }
        {isConfirming &&
          <Alert className="mb-4 bg-amber-200">
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
                Waiting for confirmation...
            </AlertDescription>
          </Alert>
        }
        {isSuccess && 
          <Alert className="mb-4 bg-lime-200">
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
                Transaction confirmed.
            </AlertDescription>
          </Alert>
        }
        {errorConfirmation && (
          <Alert className="mb-4 bg-red-400">
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {(errorConfirmation).shortMessage || errorConfirmation.message}
            </AlertDescription>
        </Alert>
        )}
        {error && (
          <Alert className="mb-4 bg-red-400">
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {(error).shortMessage || error.message}
            </AlertDescription>
        </Alert>
        )}
      </div>
      <div className="flex">
        <Input placeholder="Your number" onChange={(e) => setNumber(e.target.value)} />
        <Button variant="outline" disabled={setIsPending} onClick={setTheNumber}>{setIsPending ? 'Setting...' : 'Set'}</Button>
      </div>
      <h2 className="mt-6 mb-4 text-4xl">Events</h2>
      <div className="flex flex-col w-full">
        {events.length > 0 && events.map((event) => {
          return (
            <Event event={event} key={crypto.randomUUID()} />
          )
        })}
      </div>
    </div>
  )
}

export default SimpleStorage