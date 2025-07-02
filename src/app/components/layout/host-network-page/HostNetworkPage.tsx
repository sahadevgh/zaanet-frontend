"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wifi,
  MapPin,
  DollarSign,
  Info,
  Upload,
  Check,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Cpu,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "../../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../ui/alert";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import {
  createPublicClient,
  http,
} from "viem";
import { loadContract, uploadImageToIPFS, uploadToIPFS } from "../../web3/contants/web3Funcs";
import { network_Abi, zaanetNetwork_CA } from "../../web3/contants/projectData";
import { ethers } from "ethers";
import { arbitrumSepolia } from "viem/chains";
import { useAccount } from "wagmi";
import api from "@/lib/axios";

// Zod schema to prepare basic network data
const hostSchema = z.object({
  ssid: z.string().min(3, "Network SSID is required").max(32, "SSID too long"),
  price: z.coerce.number().min(0.1, "Price must be at least 0.1 USDT"),
  description: z.string().max(500, "Description too long").optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size < 2 * 1024 * 1024, "Image must be under 2MB")
    .optional(),
  location: z.object({
    country: z.string().min(1, "Country is required"),
    region: z.string().min(1, "Region is required"),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
    lat: z.number().min(-90).max(90, "Invalid latitude"),
    lng: z.number().min(-180).max(180, "Invalid longitude"),
  }),
  contact: z.object({
    ownerName: z.string().min(1, "Owner name is required"),
    ownerEmail: z.string().email("Invalid email address"),
    adminEmails: z.array(z.string().email("Invalid email address")).optional(),
  }),
  hardware: z.object({
    deviceType: z.enum(['raspberry-pi-4', 'raspberry-pi-5', 'custom'], {
      message: "Select a valid device type",
    }),
    specifications: z
      .object({
        cpu: z.string().optional(),
        memory: z.string().optional(),
        storage: z.string().optional(),
      })
      .optional(),
  }),
});

// Chain configuration
const chain = arbitrumSepolia;

// Public client for chain queries
export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

interface HostForm {
  ssid: string;
  price: number;
  description?: string;
  image?: File;
  location: {
    country: string;
    region: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  contact: {
    ownerName: string;
    ownerEmail: string;
    adminEmails?: string[];
  };
  hardware: {
    deviceType: 'raspberry-pi-4' | 'raspberry-pi-5' | 'custom';
    specifications?: {
      cpu?: string;
      memory?: string;
      storage?: string;
    };
  };
}

export default function HostNetworkPage() {
  const { isConnected } = useAccount();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<HostForm>({
    resolver: zodResolver(hostSchema),
    mode: "onTouched",
    defaultValues: {
      ssid: "",
      price: 1,
      description: "",
      image: undefined,
      location: {
        country: "",
        region: "",
        city: "",
        area: "",
        lat: 5.6037,
        lng: -0.187,
      },
      contact: {
        ownerName: "",
        ownerEmail: "",
        adminEmails: [],
      },
      hardware: {
        deviceType: "raspberry-pi-4",
        specifications: { cpu: "", memory: "", storage: "" },
      },
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to handle network registration
async function handleHostNetwork(data: HostForm, onComplete: (success: boolean) => void) {
  try {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Smart account is not connected.",
        variant: "destructive",
      });
      onComplete(false);
      return;
    }

    // Check if wallet is on Arbitrum Sepolia
    if (chain?.id !== arbitrumSepolia.id) {
      toast({
        title: "Error",
        description: "Please switch to Arbitrum Sepolia network in your wallet.",
        variant: "destructive",
      });
      onComplete(false);
      return;
    }

    let imageCID = "";
    if (data.image) {
      try {
        imageCID = await uploadImageToIPFS(data.image);
      } catch (ipfsError) {
        console.error('IPFS upload error:', ipfsError);
        throw new Error('Failed to upload image to IPFS');
      }
    }

    const { location } = data;
    if (
      !location.city ||
      !location.country ||
      !location.region ||
      !location.area ||
      !location.lat ||
      !location.lng
    ) {
      toast({
        title: "Error",
        description: "Please provide complete location details.",
        variant: "destructive",
      });
      onComplete(false);
      return;
    }

    const priceString = Number(data.price).toFixed(18);
    const amountToSend = ethers.parseUnits(priceString, 18);

    const metadata = {
      ssid: data.ssid,
      price: data.price,
      description: data.description,
      image: imageCID,
      ratingCount: 0,
      location: {
        country: location.country,
        region: location.region,
        city: location.city,
        area: location.area,
        coordinates: { latitude: location.lat, longitude: location.lng },
      },
      contact: data.contact,
      hardware: data.hardware,
      status: "offline",
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };

    let mongoDataId;
    try {
      const response = await api.post("/host-network", metadata, {
        timeout: 10000,
      });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to save network configuration to database");
      }
      mongoDataId = (response.data as { mongoDataId: string }).mongoDataId;
      if (!mongoDataId) {
        throw new Error("Invalid response: mongoDataId not found");
      }
    } catch (dbError: any) {
      console.error('MongoDB save error:', dbError);
      let errorMessage = "Failed to save network configuration to database";
      if (dbError.code === "ECONNABORTED") {
        errorMessage = "Request to save network timed out. Please check server status.";
      }
      throw new Error(errorMessage);
    }

    let networkContract;
    try {
      networkContract = await loadContract({
        contractAddress: zaanetNetwork_CA,
        contractABI: network_Abi,
        withSigner: true,
      });
      if (!networkContract) {
        throw new Error("Failed to initialize network contract");
      }
    } catch (contractError) {
      console.error('Contract load error:', contractError);
      // Rollback MongoDB document
      try {
        await api.delete(`/host-network/${mongoDataId}/delete-failed-network`);
        console.log(`Rolled back MongoDB document with _id: ${mongoDataId}`);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      throw new Error('Failed to load network contract. Please check wallet connection.');
    }

    try {
      const tx = await networkContract.registerNetwork(amountToSend, mongoDataId, true, {
        gasLimit: 300000,
      });
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error("Transaction failed or was reverted");
      }
    } catch (txError: any) {
      console.error('Blockchain transaction error:', txError);
      // Rollback MongoDB document
      try {
        await api.delete(`/host-network/${mongoDataId}/delete-failed-network`);
        console.log(`Rolled back MongoDB document with _id: ${mongoDataId}`);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      let errorMessage = "Blockchain transaction failed";
      if (txError.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds for transaction. Please add funds to your wallet.";
      } else if (txError.code === "ACTION_REJECTED") {
        errorMessage = "Transaction rejected by wallet. Please approve the transaction.";
      } else if (txError.reason) {
        errorMessage = `Transaction reverted: ${txError.reason}`;
      }
      throw new Error(errorMessage);
    }

    toast({
      title: "Network Listed!",
      description: "Your WiFi network is now hosted and available to users.",
    });
    onComplete(true);
  } catch (error: unknown) {
    console.error('Transaction error:', error);
    let errorMessage = "Failed to list your network. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
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
    setShowConfirm(true);
  }

  function confirmSubmit() {
    setIsLoading(true);
    const data = form.getValues();
    handleHostNetwork(data, (success) => {
      setIsLoading(false);
      setShowConfirm(false);
      if (success) {
        setSubmitted(true);
      }
    });
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("location.lat", position.coords.latitude);
        form.setValue("location.lng", position.coords.longitude);
        setGeoError("");
      },
      () => {
        setGeoError("Failed to detect your location. Please enter manually.");
      }
    );
  };

  function renderSummary(data: HostForm) {
    if (!data) return null;
    return (
      <div className="mt-8 rounded-2xl px-6 py-8 shadow-lg animate-fade-in border border-blue-500/25 bg-blue-900">
        <h2 className="text-2xl font-bold text-blue-100 flex items-center gap-2 mb-4">
          <Wifi className="text-blue-100" /> Your Hosted Network
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-200 text-sm">
          <div>
            <span className="font-semibold text-blue-100">SSID:</span> {data.ssid}
          </div>
          <div>
            <span className="font-semibold text-blue-100">Price:</span> {data.price} USDT/hour
          </div>
          <div>
            <span className="font-semibold text-blue-100">Location:</span>{" "}
            {data.location.area}, {data.location.city}, {data.location.region}, {data.location.country}
          </div>
          <div>
            <span className="font-semibold text-blue-100">Coordinates:</span>{" "}
            {data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}
          </div>
          <div>
            <span className="font-semibold text-blue-100">Owner:</span> {data.contact.ownerName} ({data.contact.ownerEmail})
          </div>
          <div>
            <span className="font-semibold text-blue-100">Hardware:</span> {data.hardware.deviceType}
          </div>
          {data.description && (
            <div className="col-span-2">
              <span className="font-semibold text-blue-100">Description:</span>{" "}
              {data.description}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isClient) {
    return null; // Skip SSR
  }

  if (submitted) {
    return (
      <div className="container max-w-2xl py-12 px-4 mx-auto">
        <div className="bg-blue-900 rounded-2xl p-8 shadow-lg flex flex-col items-center border border-blue-500/25">
          <div className="bg-blue-600 rounded-full p-6 mb-4 animate-scale-in">
            <Wifi size={48} className="text-blue-100" />
          </div>
          <h1 className="text-3xl font-bold text-blue-100 mb-3">
            Network Successfully Hosted!
          </h1>
          <p className="text-blue-200 mb-6 text-center max-w-md">
            Congratulations! Your network is now discoverable by nearby users
            and you&apos;ll start earning for every connection. You can manage
            or update your network from your dashboard.
          </p>
          {renderSummary(form.getValues())}
          <Button
            variant="default"
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              form.reset();
              setSubmitted(false);
            }}
          >
            Host Another Network
          </Button>
        </div>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="container max-w-2xl py-12 px-4 mx-auto">
        <div className="bg-blue-900 rounded-2xl p-8 shadow-lg border border-blue-500/25">
          <h1 className="text-3xl font-bold text-blue-100 mb-4">Confirm Network Details</h1>
          <p className="text-blue-200 mb-6">
            Please review the details below before listing your network.
          </p>
          {renderSummary(form.getValues())}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              className="w-full text-blue-100 border-blue-500 hover:bg-gray-900"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
            >
              Edit Details
            </Button>
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={confirmSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Listing Network...</span>
                </div>
              ) : (
                "Confirm and List"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-950 to-blue-900">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-blue-900 backdrop-blur-sm rounded-2xl inline-flex p-5 shadow-xl mb-4">
            <Upload size={36} className="text-blue-100" />
          </div>
          <h1 className="text-3xl font-bold text-blue-100 mb-2">
            Become a Network Host
          </h1>
          <p className="text-blue-200 max-w-xl mx-auto">
            Share your WiFi network and earn passive income in USDT with ZaaNet.
          </p>
        </div>

        <div className="bg-blue-900 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-500/25">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {!isConnected && (
                <Alert variant="destructive" className="bg-yellow-500/50 border-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Account Required</AlertTitle>
                  <AlertDescription>
                    Connect your smart account to host a network.
                  </AlertDescription>
                </Alert>
              )}

              {/* Network Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blue-100">Network Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ssid"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100 flex items-center">
                          <Wifi className="mr-2 text-blue-100" size={18} /> SSID
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            placeholder="E.g. ZaaNet Home"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100 flex items-center">
                          <DollarSign className="mr-2 text-blue-100" size={18} /> Price (USDT/hour)
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            type="number"
                            min={0.1}
                            step={0.1}
                            placeholder="E.g. 1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  disabled={!isConnected}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100 flex items-center">
                        <Info className="mr-2 text-blue-100" size={18} /> Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe your network (optional)"
                          maxLength={500}
                          className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-blue-300">
                        Provide any special info or rules.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  disabled={!isConnected}
                  render={({ field: { onChange } }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100 flex items-center">
                        <Upload className="mr-2 text-blue-100" size={18} /> Network Image
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-gray-900 border-blue-700 text-blue-100"
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files?.[0])}
                        />
                      </FormControl>
                      <FormDescription className="text-blue-300">
                        Upload an image to showcase your network (optional, max 2MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blue-100">Location Details</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-900 border-blue-500 text-blue-100 hover:bg-blue-700"
                    onClick={handleDetectLocation}
                    disabled={!isConnected}
                  >
                    <MapPin className="mr-2" size={18} /> Detect My Location
                  </Button>
                  {geoError && (
                    <p className="text-sm text-red-400 self-center">{geoError}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="location.country"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Country</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            placeholder="E.g. Ghana"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.region"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Region</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            placeholder="E.g. Greater Accra"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.city"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">City</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            placeholder="E.g. Accra"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.area"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Area</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            placeholder="E.g. Osu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location.lat"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Latitude</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            type="number"
                            step="any"
                            placeholder="E.g. 5.6037"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.lng"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Longitude</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            type="number"
                            step="any"
                            placeholder="E.g. -0.187"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("location.lat") && form.watch("location.lng") && (
                  <div className="mt-4 rounded-lg overflow-hidden h-64 border border-blue-700">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      loading="lazy"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${form.watch(
                        "location.lat"
                      )},${form.watch("location.lng")}&z=15&output=embed`}
                      allowFullScreen
                      title="Network Location Preview"
                    ></iframe>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blue-100">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contact.ownerName"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100 flex items-center">
                          <User className="mr-2 text-blue-100" size={18} /> Owner Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            placeholder="E.g. John Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.ownerEmail"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100 flex items-center">
                          <Mail className="mr-2 text-blue-100" size={18} /> Owner Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                            type="email"
                            placeholder="E.g. john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contact.adminEmails"
                  disabled={!isConnected}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100 flex items-center">
                        <Mail className="mr-2 text-blue-100" size={18} /> Admin Emails (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                          placeholder="E.g. admin1@example.com,admin2@example.com"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((email) => email.trim())
                                .filter((email) => email)
                            )
                          }
                          value={field.value?.join(",") || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-blue-300">
                        Enter multiple emails separated by commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hardware Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blue-100">Hardware Details</h2>
                <FormField
                  control={form.control}
                  name="hardware.deviceType"
                  disabled={!isConnected}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100 flex items-center">
                        <Cpu className="mr-2 text-blue-100" size={18} /> Device Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isConnected}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-900 border-blue-700 text-blue-100">
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-900 border-blue-700 text-blue-100">
                          <SelectItem value="raspberry-pi-4">Raspberry Pi 4</SelectItem>
                          <SelectItem value="raspberry-pi-5">Raspberry Pi 5</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("hardware.deviceType") === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="hardware.specifications.cpu"
                      disabled={!isConnected}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">CPU</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                              placeholder="E.g. Quad-core 1.5 GHz"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hardware.specifications.memory"
                      disabled={!isConnected}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">Memory</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                              placeholder="E.g. 4GB RAM"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hardware.specifications.storage"
                      disabled={!isConnected}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">Storage</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-gray-900 border-blue-700 text-blue-100 placeholder-blue-400"
                              placeholder="E.g. 32GB SD"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing...</span>
                  </div>
                ) : (
                  "Review and List Network"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-blue-100 mb-4">
              Why Host on ZaaNet?
            </h2>
            <ul className="space-y-3 text-sm text-blue-200">
              {[
                "Earn passive income in USDT",
                "Connect your community with reliable WiFi",
                "Secure blockchain-based payments",
                "Full control over pricing and availability",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1 rounded-full">
                    <Check className="w-3 h-3 text-blue-100" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-blue-100 mb-4">Getting Started</h2>
            <ul className="space-y-3 text-sm text-blue-200">
              {[
                "Enter your network SSID and price",
                "Specify your location and contact details",
                "Select your hardware configuration",
                "Review and list on the blockchain",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1 rounded-full">
                    <Wifi className="w-3 h-3 text-blue-100" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}