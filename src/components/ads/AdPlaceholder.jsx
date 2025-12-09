import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function AdPlaceholder({ title }) {
  return (
    <Card className="bg-slate-800/20 border-slate-700/50 backdrop-blur border-dashed text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-400 text-sm font-normal flex items-center justify-center gap-2">
          <Megaphone className="w-4 h-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900/30 p-4 rounded-lg">
          <p className="text-xs text-slate-500">
            Your ad code snippet goes here. Edit this component to add your provider's code.
          </p>
          {/* 
            <!-- 
              PASTE YOUR ADVERTISEMENT CODE HERE. 
              For example, your Google AdSense script:
            
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-your-client-id"
                   crossorigin="anonymous"></script>
              <ins class="adsbygoogle"
                   style="display:block"
                   data-ad-client="ca-pub-your-client-id"
                   data-ad-slot="your-slot-id"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              <script>
                   (adsbygoogle = window.adsbygoogle || []).push({});
              </script>
            --> 
          */}
        </div>
      </CardContent>
    </Card>
  );
}