#!/usr/bin/perl -w
=head1

utf8ify_pinyin.pl
Copyright 2003 by Forrest Cahoon (hanziquiz@abstractfactory.org)

This program converts anything that looks like ASCII pinyin with tone
numbers at the end of the word and converts it into utf-8 with proper
pinyin tone marks.  It will only work if the pinyin syllables are
seperated (e.g. "fei1 chang2" will be converted, but "fei1chang2" will
not).

It takes an optional parameter as a filename. If no filename is
specified, it uses "hanzicards.js", because this code is distributed
as a part of Hanzi Quiz (which can be found online at
http://www.abstractfactory.org/hanziquiz/).

The original file is backed up to a file ending in "_bak"
(e.g. "hanzicards.js_bak"), then replaced with the new version.

This program is free software; you can redistribute it and|or modify it
under the same terms as Perl itself.

=cut
use strict;

my %UTF8_PINYIN_TONES =
  (a => [ "\xc4\x81", "\xc3\xa1", "\xc7\x8e", "\xc3\xa0", "a" ],
   o => [ "\xc5\x8d", "\xc3\xb3", "\xc7\x92", "\xc3\xb2", "o" ],
   e => [ "\xc4\x93", "\xc3\xa9", "\xc4\x9b", "\xc3\xa8", "e" ],
   i => [ "\xc4\xab", "\xc3\xad", "\xc7\x90", "\xc3\xac", "i" ],
   u => [ "\xc5\xab", "\xc3\xba", "\xc7\x94", "\xc3\xb9", "u" ],
   v => [ "\xc7\x96", "\xc7\x98", "\xc7\x9a", "\xc7\x9c", "\xc3\xbc" ]);

my %FINAL_ACCENT_LETTERS =
  ("a" => "a",  "ai" => "a",  "an" => "a",  "ang" => "a",  "ao" => "a",
   "e" => "e",  "ei" => "e",  "en" => "e",  "er" => "e",  "eng" => "e",
   "i" => "i",  "ia" => "a",  "ian" => "a",  "iang" => "a",  "iao" => "a",
   "ie" => "e",  "in" => "i",  "ing" => "i",  "iong" => "o",  "iu" => "u",
   "o" => "o",  "ong" => "o",  "ou" => "o",  "u" => "u",  "ua" => "a",
   "uai" => "a",  "uan" => "a",  "uang" => "a",  "ue" => "e",  "ui" => "i",
   "un" => "u",  "uo" => "o",  "v" => "v",  "ve" => "e");

my $in_fname = $ARGV[0] || "hanzicards.js";
my $out_fname = $in_fname . "_utf8";
open IN, $in_fname || die
  "Couldn't open $in_fname for reading\n";
open OUT, ">" . $out_fname ||
  die "Couldn't open $out_fname for writing\n";

while (<IN>) {
   s/(\b\w+[1-5]\b)/fix_pinyin($1)/eg;
   print OUT $_;
}
close IN;
close OUT;

rename $in_fname, $in_fname . "_bak";
rename $out_fname, $in_fname;

###############################################################################

sub fix_pinyin {
   my ($orig_word) = @_;
   my ($word, $initial, $final, $tone, $accent_loc, $accented_letter);

   # if anything goes wrong, we return the original
   # word unchanged, so get a copy to work on.
   $word = $orig_word;

   # Convert common representations of u with umlaut
   # ("u:", "uu" and the iso-8859-1 codepoint)
   # to our preferred internal representation "v"
   $word =~ s/(u[:u]|\xfc)/v/g;

   if ($word =~ /^([^aeiouv]*(\D+))(\d)$/) {
      $word = $1; $final = $2; $tone = $3;
   } else {
      return $orig_word;
   }

   $accent_loc = $FINAL_ACCENT_LETTERS{$final};
   if (!defined($accent_loc)) { return $orig_word; }
   $accented_letter = $UTF8_PINYIN_TONES{$accent_loc}->[$tone - 1];
   if (!defined($accented_letter)) { return $orig_word; }

   $word =~ s/$accent_loc/$accented_letter/;

   # Finally, change any "v" to a proper utf8 u with umlaut:
   $word =~ s/v/\xc3\xbc/g;

   return $word;
}

###############################################################################

__END__
