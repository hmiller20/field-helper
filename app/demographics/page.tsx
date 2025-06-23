'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { updateSession } from '../utils/sessionData';

export default function Demographics() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    gender: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demographics submitted:', formData);
    
    // Save demographics data to session
    updateSession({ 
      demographics: {
        age: formData.age,
        gender: formData.gender
      }
    });
    
    // Navigate to debriefing page
    router.push('/debriefing');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Demographics Survey
            </CardTitle>
            <CardDescription className="text-center">
              Please provide some basic information about yourself. This information will remain confidential and is used for research purposes only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter your age"
                />
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="man" id="man" />
                    <Label htmlFor="man">Man</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="woman" id="woman" />
                    <Label htmlFor="woman">Woman</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-binary" id="non-binary" />
                    <Label htmlFor="non-binary">Non-binary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                    <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-center pt-4">
                <Button type="submit" className="w-full max-w-md">
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
