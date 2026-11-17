import React from 'react';
import {Composition} from 'remotion';
import {ChatVideo} from './ChatVideo';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';

export const RemotionRoot = () => (
  <Composition id="Chat" component={ChatVideo} durationInFrames={30 * 58} fps={30} width={1080} height={1920} />
);
