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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { HostForm } from "@/types";
import { Button } from "../../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../ui/alert";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";



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
  image: z
    .instanceof(File)
    .refine((file) => file.size < 2 * 1024 * 1024, "Image must be under 2MB")
    .optional(),
});

export default function HostNetworkPage() {
  // Mock values to make the component render without errors
  const isConnected = true;
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [geoError, setGeoError] = useState("");

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
  })

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function onSubmit(data: HostForm) {
    setIsLoading(true);
    // Mock implementation
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast({
        title: "Network Listed!",
        description: "Your WiFi network is now hosted and available to users.",
      });
    }, 1500);
  }

  // Add inside your component
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
      <div className="mt-8 rounded-2xl px-6 py-8 shadow-lg animate-fade-in border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-100 flex items-center gap-2 mb-2">
          <Wifi className="text-blue-100" /> Your Hosted Network
        </h2>
        <div className="mb-4 text-gray-600">
          <span className="font-semibold">{data.ssid}</span> in{" "}
          <span className="text-blue-100">
            {data.location.city}, {data.location.area}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 my-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="text-blue-100" size={18} />
            <span>
              <span className="font-bold">{data.price}</span> USDT/day
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-100" size={18} />
            <span>
              {data.location.city}, {data.location.area}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="text-blue-100" size={18} />
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
        <div className="bg-blue-900 rounded-2xl p-8 shadow-lg">
          <div className="bg-blue-900/10 rounded-full p-6 mb-4 animate-scale-in">
            <Wifi size={48} className="text-blue-100" />
          </div>
          <h1 className="text-3xl font-bold text-blue-100 mb-3">
            Network Successfully Hosted!
          </h1>
          <p className="text-gray-700 mb-6 text-center">
            Congratulations! Your network is now discoverable by nearby users
            and you&apos;ll start earning for every connection. You can manage
            or update your network from your dashboard.
          </p>
          {renderSummary(form.getValues())}
          <Button
            className="mt-8 bg-blue-900 hover:bg-blue-900-dark text-white"
            onClick={() => setSubmitted(false)}
          >
            Host Another Network
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-blue-900 backdrop-blur-sm rounded-2xl inline-flex p-5 shadow-xl mb-4">
            <Upload size={36} className="text-blue-100" />
          </div>
          <h1 className="text-3xl font-bold text-blue-100 mb-2">
            Become a Host
          </h1>
          <p className="text-blue-200 max-w-xl mx-auto">
            Share your WiFi and earn passive income in USDT.
          </p>
        </div>

        <div className="bg-blue-900 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Account Required</AlertTitle>
                  <AlertDescription>
                    You must connect a your account to become a provider.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First column */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="ssid"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">
                          <Wifi className="inline -mt-1 mr-1 text-blue-100" />{" "}
                          Network Name
                        </FormLabel>
                        <FormControl>
                          <Input className="bg-blue-100" placeholder="E.g. ZaaNet Home" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    disabled={!isConnected}
                    name="speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">
                          <Wifi className="inline -mt-1 mr-1 text-blue-100" />{" "}
                          WiFi Speed (Mbps)
                        </FormLabel>
                        <FormControl>
                          <Input className="bg-blue-100"
                            type="number"
                            min={1}
                            step={1}
                            placeholder="e.g. 25"
                            required
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
                        <FormLabel className="text-blue-100">
                          <DollarSign className="inline -mt-1 mr-1 text-blue-100" />{" "}
                          Price (USDT/day)
                        </FormLabel>
                        <FormControl>
                          <Input className="bg-blue-100"
                            type="number"
                            min={0.002}
                            step={0.002}
                            placeholder="e.g. 0.02"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Second column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium flex items-center text-blue-100">
                      <MapPin className="mr-1 text-blue-100" /> Location
                    </label>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={handleDetectLocation}
                    >
                      📍 Use My Current Location
                    </Button>
                    
                    {geoError && <p className="text-xs text-red-500 mt-1">{geoError}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="location.lat"
                      disabled={!isConnected}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">Latitude</FormLabel>
                          <FormControl>
                            <Input className="bg-blue-100"
                              type="number"
                              step="any"
                              placeholder="e.g. 5.6037"
                              {...field}
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
                            <Input className="bg-blue-100"
                              type="number"
                              step="any"
                              placeholder="e.g. -0.187"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="location.country"
                      disabled={!isConnected}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">Country</FormLabel>
                          <FormControl>
                            <Input className="bg-blue-100" placeholder="Ghana" {...field} />
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
                            <Input className="bg-blue-100" 
                            placeholder="Accra" {...field} />
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
                            <Input className="bg-blue-100" placeholder="Osu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Third column */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    disabled={!isConnected}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">
                          <Info className="inline -mt-1 mr-1 text-blue-100" />{" "}
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Any special info or house rules? (optional)"
                            maxLength={400}
                            className="bg-blue-100"
                            {...field}
                          />
                        </FormControl>
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
                        <FormLabel className="text-blue-100">
                          <Upload className="inline -mt-1 mr-1 text-blue-100" />{" "}
                          Add a Photo
                        </FormLabel>
                        <FormControl>
                          <Input className="bg-blue-100"
                            type="file"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files?.[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Show where users connect from.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Map preview */}
              {form.watch("location.lat") && form.watch("location.lng") && (
                <div className="mt-4 rounded-lg overflow-hidden h-40 border border-gray-200">
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
                  ></iframe>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                className="w-full font-semibold transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || !isConnected}
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

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-800 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <h2 className="text-lg font-bold text-blue-100 mb-3">
              Why Host on ZaaNet?
            </h2>
            <ul className="space-y-2 text-sm">
              {[
                "Earn effortless crypto income",
                "Empower your community",
                "Full control over your network",
                "Secure payments handled automatically",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="bg-black p-1 rounded-full">
                    <Check className="w-3 h-3 text-blue-100" />
                  </div>
                  <span className="text-blue-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-4 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-3">Getting Started</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <Wifi className="w-3 h-3" />
                </div>
                <span>Enter your WiFi details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                </div>
                <span>Set your location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <DollarSign className="w-3 h-3" />
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