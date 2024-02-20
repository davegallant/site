let
  channel = "nixos-23.11";
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  name = "hugo site";
  buildInputs = [
    pkgs.hugo
  ];
}
