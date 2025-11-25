// src/app/444/page.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createRubberBandNode } from 'rubberband-web';
import { Mp3Encoder } from '@breezystack/lamejs';
import { toast } from 'sonner';
export default function Page() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // Helper function to convert Float32Array to Int16Array
    function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
        const int16 = new Int16Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
            const s = Math.max(-1, Math.min(1, buffer[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16;
    }

    const convertAudio = async (file: File) => {
        setLoading(true);

        try {
            const limitRes = await fetch('/api/rate-limit', { method: 'POST' });
            if (!limitRes.ok) {
                const data = await limitRes.json();
                toast.error(data.error);
                return;
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Rate limit check failed';
            toast.error(errorMessage);
            return;
        }

        setStatus('Decoding audio...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioCtx = new AudioContext();
            const originalBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            setStatus('Loading Rubber Band WASM...');

            // Create node
            const rbNode = await createRubberBandNode(audioCtx, '/rubberband-processor.js');

            // CORRECT 2025 API — clean and simple
            rbNode.setPitch(Math.pow(2, 9.775 / 1200)); // 440 → 444 Hz
            rbNode.setTempo(1.0);                       // preserve original tempo
            rbNode.setHighQuality(true);

            // Offline processing
            const offlineCtx = new OfflineAudioContext(
                originalBuffer.numberOfChannels,
                Math.ceil(originalBuffer.length * 1.05),
                originalBuffer.sampleRate
            );

            const source = offlineCtx.createBufferSource();
            source.buffer = originalBuffer;

            const offlineRbNode = await createRubberBandNode(offlineCtx, '/rubberband-processor.js');
            offlineRbNode.setPitch(Math.pow(2, 9.775 / 1200));
            offlineRbNode.setTempo(1.0);
            offlineRbNode.setHighQuality(true);

            source.connect(offlineRbNode);
            offlineRbNode.connect(offlineCtx.destination);
            source.start();

            setStatus('Converting to 444 Hz + adding 1111 Hz angel tone...');
            const shiftedBuffer = await offlineCtx.startRendering();

            // Add 1111 Hz layer
            const finalBuffer = audioCtx.createBuffer(
                shiftedBuffer.numberOfChannels,
                shiftedBuffer.length,
                shiftedBuffer.sampleRate
            );

            for (let ch = 0; ch < shiftedBuffer.numberOfChannels; ch++) {
                const input = shiftedBuffer.getChannelData(ch);
                const output = finalBuffer.getChannelData(ch);
                for (let i = 0; i < input.length; i++) {
                    const angel = Math.sin(2 * Math.PI * 1111 * i / shiftedBuffer.sampleRate) * 0.15;
                    output[i] = Math.tanh(input[i] + angel);
                }
            }

            setStatus('Encoding to MP3...');

            // Convert to MP3
            const channels = finalBuffer.numberOfChannels;
            const sampleRate = finalBuffer.sampleRate;
            const kbps = 192;
            const mp3encoder = new Mp3Encoder(channels, sampleRate, kbps);

            const mp3Data: BlobPart[] = [];
            const sampleBlockSize = 1152;

            if (channels === 1) {
                const samples = finalBuffer.getChannelData(0);
                const samplesMono = convertFloat32ToInt16(samples);

                for (let i = 0; i < samplesMono.length; i += sampleBlockSize) {
                    const sampleChunk = samplesMono.subarray(i, i + sampleBlockSize);
                    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                    if (mp3buf.length > 0) {
                        mp3Data.push(mp3buf as unknown as BlobPart);
                    }
                }
            } else {
                const left = finalBuffer.getChannelData(0);
                const right = finalBuffer.getChannelData(1);
                const leftInt16 = convertFloat32ToInt16(left);
                const rightInt16 = convertFloat32ToInt16(right);

                for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
                    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
                    const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
                    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                    if (mp3buf.length > 0) {
                        mp3Data.push(mp3buf as unknown as BlobPart);
                    }
                }
            }

            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf as unknown as BlobPart);
            }

            const blob = new Blob(mp3Data, { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.split('.').slice(0, -1).join('.')}_444Hz_1111Hz.mp3`;
            a.click();
            URL.revokeObjectURL(url);

            setStatus('Done — Converted to healing frequencies');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setStatus('Error: ' + errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            convertAudio(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac']
        },
        multiple: false,
        disabled: loading
    });

    return (
        <div style={{
            minHeight: 'calc(100vh - 57px)',
            background: 'linear-gradient(135deg, #1a0033, #000)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            fontFamily: 'system-ui'
        }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                Divine Frequency Converter
            </h1>
            <p style={{ color: '#bb88ff', margin: '1rem 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 600 }}>
                444 Hz + 1111 Hz Angel Tones
            </p>
            <p style={{ color: '#9988dd', margin: '0 0 2rem 0', fontSize: '1.2rem' }}>
                Upload any track → instant healing frequency MP3
            </p>

            <div
                {...getRootProps()}
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    padding: '4rem 2rem',
                    border: isDragActive
                        ? '3px dashed #ff00ff'
                        : '3px dashed #9900ff',
                    borderRadius: '24px',
                    background: isDragActive
                        ? 'linear-gradient(135deg, rgba(153, 0, 255, 0.2), rgba(255, 0, 255, 0.2))'
                        : 'linear-gradient(135deg, rgba(153, 0, 255, 0.1), rgba(255, 0, 255, 0.05))',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isDragActive
                        ? '0 0 40px rgba(255, 0, 255, 0.4)'
                        : '0 0 20px rgba(153, 0, 255, 0.2)',
                    opacity: loading ? 0.6 : 1
                }}
            >
                <input {...getInputProps()} />

                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    filter: isDragActive ? 'brightness(1.5)' : 'brightness(1)',
                    transition: 'filter 0.3s ease'
                }}>
                    🎵
                </div>

                {isDragActive ? (
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#ff00ff',
                        margin: 0
                    }}>
                        Drop the track here... ✨
                    </p>
                ) : (
                    <div>
                        <p style={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#bb88ff',
                            margin: '0 0 0.5rem 0'
                        }}>
                            {loading ? 'Processing...' : 'Drag & drop your audio file here'}
                        </p>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#8855cc',
                            margin: 0
                        }}>
                            or click to browse
                        </p>
                    </div>
                )}
            </div>

            {loading && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem 2rem',
                    background: 'rgba(255, 0, 255, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 0, 255, 0.3)'
                }}>
                    <p style={{
                        fontSize: '1.3rem',
                        color: '#ff00ff',
                        margin: 0,
                        fontWeight: 500
                    }}>
                        ⏳ {status}
                    </p>
                </div>
            )}

            {status.includes('Done') && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem 2rem',
                    background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(0, 255, 170, 0.05))',
                    borderRadius: '12px',
                    border: '2px solid #00ffaa',
                    boxShadow: '0 0 30px rgba(0, 255, 170, 0.3)'
                }}>
                    <p style={{
                        fontSize: '2rem',
                        color: '#00ffaa',
                        fontWeight: 'bold',
                        margin: 0
                    }}>
                        ✅ Conversion Complete!
                    </p>
                </div>
            )}
        </div>
    );
}