import { connectToDatabase } from '@/app/server/db/mongoDB';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        await connectToDatabase();

        const metadata = await request.json();

        // Validate metadata existence
        if (!metadata) {
            console.error('No metadata provided in request');
            return NextResponse.json(
                { error: 'Metadata is required' },
                { status: 400 }
            );
        }

        // Validate required fields
        const requiredFields = ['ssid', 'price', 'description', 'location', 'contact'];
        const missingFields = requiredFields.filter(field => !metadata[field]);
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate nested required fields
        if (!metadata.location.country || !metadata.location.region || !metadata.location.city || !metadata.location.area) {
            console.error('Incomplete location data:', metadata.location);
            return NextResponse.json(
                { error: 'Complete location details (country, region, city, area) are required' },
                { status: 400 }
            );
        }

        if (!metadata.contact.ownerName || !metadata.contact.ownerEmail) {
            console.error('Incomplete contact data:', metadata.contact);
            return NextResponse.json(
                { error: 'Contact ownerName and ownerEmail are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(metadata.contact.ownerEmail)) {
            console.error('Invalid ownerEmail:', metadata.contact.ownerEmail);
            return NextResponse.json(
                { error: 'Invalid owner email format' },
                { status: 400 }
            );
        }
        if (metadata.contact.adminEmails) {
            for (const email of metadata.contact.adminEmails) {
                if (!emailRegex.test(email)) {
                    console.error('Invalid adminEmail:', email);
                    return NextResponse.json(
                        { error: `Invalid admin email: ${email}` },
                        { status: 400 }
                    );
                }
            }
        }

        // Validate hardware deviceType
        const validDeviceTypes = ['raspberry-pi-4', 'raspberry-pi-5', 'custom'];
        if (metadata.hardware && metadata.hardware.deviceType && !validDeviceTypes.includes(metadata.hardware.deviceType)) {
            console.error('Invalid deviceType:', metadata.hardware.deviceType);
            return NextResponse.json(
                { error: `Invalid device type: must be one of ${validDeviceTypes.join(', ')}` },
                { status: 400 }
            );
        }

        console.log(metadata.price, typeof metadata.price);
        const priceInNumber = Number(metadata.price);

        // Validate price
        if (typeof priceInNumber !== 'number' || priceInNumber < 0.1) {
            console.error('Invalid price:', priceInNumber);
            return NextResponse.json(
                { error: 'Price must be a number greater than or equal to 0.1' },
                { status: 400 }
            );
        }

        // Generate networkId if not provided
        const networkId = metadata.networkId || uuidv4();

        // Prepare NetworkConfig data
        const networkConfig = {
            networkId,
            ssid: metadata.ssid,
            price: priceInNumber,
            description: metadata.description,
            image: metadata.image || '',
            location: {
                country: metadata.location.country,
                region: metadata.location.region,
                city: metadata.location.city,
                area: metadata.location.area,
                coordinates: metadata.location.coordinates || { latitude: 0, longitude: 0 },
            },
            contact: {
                ownerName: metadata.contact.ownerName,
                ownerEmail: metadata.contact.ownerEmail,
                adminEmails: metadata.contact.adminEmails || [],
            },
            hardware: {
                deviceType: metadata.hardware?.deviceType || 'raspberry-pi-4',
                specifications: metadata.hardware?.specifications || {
                    cpu: '',
                    memory: '',
                    storage: '',
                },
            },
            status: 'offline', // Default per schema
            createdAt: metadata.createdAt ? new Date(metadata.createdAt) : new Date(),
            lastSeen: metadata.lastSeen ? new Date(metadata.lastSeen) : new Date(),
        };

        // Save to MongoDB
        const savedConfig = await NetworkConfigModel.findOneAndUpdate(
            { networkId: networkConfig.networkId },
            {
                $set: networkConfig,
                $setOnInsert: { createdAt: networkConfig.createdAt },
            },
            { upsert: true, new: true, runValidators: true }
        );

        console.log(`Successfully saved NetworkConfig for ${networkConfig.ssid} with _id: ${savedConfig._id}`);

        return NextResponse.json(
            { mongoDataId: savedConfig._id.toString() },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating host network:', {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
        });

        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { error: `Validation error: ${error.message}` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create host network' },
            { status: 500 }
        );
    }
}
