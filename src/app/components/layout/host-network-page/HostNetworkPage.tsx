"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wifi, MapPin, DollarSign, Info, Upload, Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { HostForm } from "@/types";
import { loadContract, uploadImageToIPFS, uploadToIPFS } from "../../web3/contants/web3Funcs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { contract_Abi, contractAddress } from "../../web3/contants/projectData";

// Zod schema
const hostSchema = z.object({
  ssid: z.string().min(3, "Network name is required"),
  location: z.object({
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
    lat: z.number().min(-90).max(90, "Invalid latitude"),
    lng: z.number().min(-180).max(180, "Invalid longitude"),
  }),
  speed: z.coerce.number().min(1, "Minimum 1 Mbps"),
  price: z.coerce.number().min(0.1, "Set at least 0.1 USDT"),
  description: z.string().max(500, "Description too long").optional(),
  image: z.instanceof(File).refine((file) => file.size < 2 * 1024 * 1024, "Image must be under 2MB").optional(),
});

export default function HostNetworkPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isClient, setIsClient] = useState(false);

  const form = useForm<HostForm>({
    resolver: zodResolver(hostSchema),
    mode: "onTouched",
    defaultValues: {
      ssid: "",
      location: { country: "", city: "", area: "", lat: 5.6037, lng: -0.187 },
      speed: 25,
      price: 1,
      description: "",
      image: undefined,
    },
  });

  useEffect(() => {
    setIsClient(true); 
  }, []);


  useEffect(() => {
    async function initializeContract() {
      const contractInstance = await loadContract({
        contractAddress,
        contractABI: contract_Abi,
        withSigner: true
      });
      if (contractInstance) {
        setContract(contractInstance);
      } else {
        console.error("Failed to load contract");
        toast({
          title: "Error",
          description: "Failed to load blockchain contract.",
          variant: "destructive",
        });
      }
    }
    if (isClient) {
      initializeContract();
    }
  }, [isClient]);

  async function handleHostNetwork(data: HostForm, onComplete: (success: boolean) => void) {
    try {
      if (!contract) {
        toast({
          title: "Error",
          description: "Contract or wallet not loaded.",
          variant: "destructive",
        });
        onComplete(false);
        return;
      }

      // Validate image upload
      let imageCID = "";
      if (data.image) {
        imageCID = await uploadImageToIPFS(data.image);
      }

      // Validate location
      // Check if all location fields are filled
      if (
        !data.location.city ||
        !data.location.country ||
        !data.location.area ||
        !data.location.lat ||
        !data.location.lng
      ) {
        toast({
          title: "Error",
          description: "Please select a valid location on the map.",
          variant: "destructive",
        });
        onComplete(false);
        return;
      }
      
      const priceString = Number(data.price).toFixed(18); // convert float safely
      const amountToSend = ethers.parseUnits(priceString, 18);
      
      // Create metadata
      const metadata = {
        ssid: data.ssid,
        location: {
          country: data.location.country,
          city: data.location.city,
          area: data.location.area,
          lat: data.location.lat,
          lng: data.location.lng
        },
        speed: data.speed,
        description: data.description || "",
        image: imageCID,
        createdAt: new Date().toISOString() // Store creation date
      };
      
      // Upload metadata to IPFS
      const metadataCID = await uploadToIPFS(JSON.stringify(metadata));
      
      // Send transaction to register network
      const tx = await contract.registerNetwork(
        amountToSend,
        metadataCID,
        true // isActive
      );

      await tx.wait();

      toast({
        title: "Network Listed!",
        description: "Your WiFi network is now hosted and available to users.",
      });
      onComplete(true);
    } catch (error: unknown) {
      console.error("Transaction error:", error);
      let errorMessage = "Failed to list your network. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Invalid IPFS CID")) {
          errorMessage = "Failed to upload password to IPFS.";
        } else if (error.message.includes("Encryption verification")) {
          errorMessage = "Failed to verify password encryption.";
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      onComplete(false);
    }
  }

  async function onSubmit(data: HostForm) {
    setIsLoading(true);
    await handleHostNetwork(data, (success) => {
      setIsLoading(false);
      if (success) {
        setSubmitted(true);
      }
    });
  }

  function renderSummary(data: HostForm) {
    if (!data) return null;
    return (
      <div className="mt-8 bg-gradient-to-br from-white to-zaanet-soft-purple rounded-2xl px-6 py-8 shadow-lg animate-fade-in border border-zaanet-purple/10">
        <h2 className="text-2xl font-bold text-zaanet-purple flex items-center gap-2 mb-2">
          <Wifi className="text-zaanet-purple" /> Your Hosted Network
        </h2>
        <div className="mb-4 text-gray-600">
          <span className="font-semibold">{data.ssid}</span> in{" "}
          <span className="text-zaanet-purple">
            {data.location.city}, {data.location.area}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 my-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="text-zaanet-purple" size={18} />
            <span>
              <span className="font-bold">{data.price}</span> USDT/day
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="text-zaanet-purple" size={18} />
            <span>
              {data.location.city}, {data.location.area}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="text-zaanet-purple" size={18} />
            <span>{data.speed} Mbps</span>
          </div>
        </div>
        {data.description && (
          <div className="text-gray-500 mt-2">
            <Info size={18} className="inline mr-1" />
            {data.description}
          </div>
        )}
      </div>
    );
  }

  if (!isClient) {
    return null; // Skip SSR
  }

  if (submitted) {
    return (
      <div className="container max-w-2xl py-12 px-4 mx-auto">
        <div className="bg-gradient-to-br from-zaanet-soft-purple to-white rounded-2xl p-8 shadow-lg">
          <div className="bg-zaanet-purple/10 rounded-full p-6 mb-4 animate-scale-in">
            <Wifi size={48} className="text-zaanet-purple" />
          </div>
          <h1 className="text-3xl font-bold text-zaanet-purple mb-3">
            Network Successfully Hosted!
          </h1>
          <p className="text-gray-700 mb-6 text-center">
            Congratulations! Your network is now discoverable by nearby users and
            you&apos;ll start earning for every connection. You can manage or
            update your network from your dashboard.
          </p>
          {renderSummary(form.getValues())}
          <Button
            className="mt-8 bg-zaanet-purple hover:bg-zaanet-purple-dark text-white"
            onClick={() => setSubmitted(false)}
          >
            Host Another Network
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-zaanet-soft-purple">
      <div className="container max-w-2xl py-12 px-4 mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6 animate-scale-in">
            <Upload size={42} className="text-zaanet-purple" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zaanet-purple mb-4 text-center">
            Become a Host
          </h1>
          <p className="text-gray-700 text-center max-w-xl mb-6 text-lg">
            Share your WiFi and earn passive income in USDT.
            <br />
            <span className="text-zaanet-purple font-medium">
              It&apos;s easy, instant, and secure.
            </span>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-12 animate-fade-in">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ssid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Wifi className="inline -mt-1 mr-1 text-zaanet-purple" />{" "}
                      Network Name (SSID)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. ZaaNet Home" required {...field} />
                    </FormControl>
                    <FormDescription>
                      Pick a friendly name for your WiFi.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
        
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <MapPin className="inline -mt-1 mr-1 text-zaanet-purple" /> Location
                </label>
                <p className="text-sm text-muted-foreground">
                  Click on the map to set your network’s location.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ghana" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Accra" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Osu" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Wifi className="inline -mt-1 mr-1 text-zaanet-purple" />{" "}
                        WiFi Speed (Mbps)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="e.g. 25"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your internet package speed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <DollarSign className="inline -mt-1 mr-1 text-zaanet-purple" />{" "}
                        Price (USDT/day)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0.002}
                          step={0.002}
                          placeholder="e.g. 0.02"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Users pay this to connect for a day.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Info className="inline -mt-1 mr-1 text-zaanet-purple" />{" "}
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Any special info or house rules? (optional)"
                        maxLength={400}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      E.g. “Available 24/7, please use respectfully.”
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>
                      <Upload className="inline -mt-1 mr-1 text-zaanet-purple" />{" "}
                      Add a Photo
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      (Optional) Show where users should connect from.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-zaanet-purple to-zaanet-purple-dark hover:opacity-90 text-white mt-6 font-semibold transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Listing Network...</span>
                  </div>
                ) : (
                  "List My Network"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-14">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-zaanet-purple mb-6">
              Why Host on ZaaNet?
            </h2>
            <ul className="space-y-4">
              {[
                "Earn effortless crypto income",
                "Empower your community",
                "Full control over your network",
                "Secure payments handled automatically",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-zaanet-soft-purple p-2 rounded-full">
                    <Check className="w-4 h-4 text-zaanet-purple" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-zaanet-purple to-zaanet-purple-dark rounded-2xl p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Wifi className="w-4 h-4" />
                </div>
                <span>Enter your WiFi details</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Set your location</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span>Choose your price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}