"use client";

import * as React from "react";
import { Check, LogOut, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  DEFAULT_PROFILE,
  clearProfile,
  readProfile,
  writeProfile,
  type Profile,
} from "@/lib/profile-store";
import { BUDGETS, PACES, FOOD_PREFERENCES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedCard } from "@/components/ui/segmented-card";
import { OptionChip } from "@/components/ui/option-chip";
import { Button } from "@/components/ui/button";

export function ProfileClient() {
  const [profile, setProfile] = React.useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => setProfile(readProfile()), []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function toggleFood(value: Profile["foodPreferences"][number]) {
    setProfile((p) => ({
      ...p,
      foodPreferences: p.foodPreferences.includes(value)
        ? p.foodPreferences.filter((f) => f !== value)
        : [...p.foodPreferences, value],
    }));
    setSaved(false);
  }

  function save() {
    writeProfile(profile);
    setSaved(true);
  }

  function signOut() {
    clearProfile();
    setProfile(DEFAULT_PROFILE);
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UserRound className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground">
            Defaults we&apos;ll prefill on your next trip.
          </p>
        </div>
        <ThemeToggle className="ml-auto" />
      </header>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={profile.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default budget</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentedCard
              options={BUDGETS}
              value={profile.defaultBudget}
              onChange={(v) => update("defaultBudget", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Travel style</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentedCard
              options={PACES}
              value={profile.defaultTravelStyle}
              onChange={(v) => update("defaultTravelStyle", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2.5">
              {FOOD_PREFERENCES.map((opt) => (
                <OptionChip
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  selected={profile.foodPreferences.includes(opt.value)}
                  onToggle={() => toggleFood(opt.value)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
          <Button onClick={save}>
            {saved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
