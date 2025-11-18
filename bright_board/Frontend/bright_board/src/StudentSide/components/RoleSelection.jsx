import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, School, Lightbulb } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Lightbulb className="w-16 h-16 text-white" />
        </div>
        <h1 className="font-comic text-2xl mb-2">Welcome to BrightBoard</h1>
        <p className="text-bw-75 mb-8">Please select your role to continue</p>

        <div className="flex flex-col gap-4 mb-6">
          <Button fullWidth onClick={() => navigate('/a/signup')} className="flex gap-2 justify-center">
            <GraduationCap size={20} />
            I am a Tutor
          </Button>
          <Button fullWidth variant="outline" onClick={() => navigate('/s/signup')} className="flex gap-2 justify-center">
            <School size={20} />
            I am a Student
          </Button>
        </div>

        <p className="text-bw-62 text-sm">Choose the option that best describes your role</p>
      </Card>
    </div>
  );
};

export default RoleSelection;