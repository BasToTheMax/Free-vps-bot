ID=$1

pct stop $1

file="/ports/$(echo $ID).sh"

# Check if the file exists
if [ ! -f "$file" ]; then
  echo "File not found: $file"
  pct destroy $ID
  exit 1
fi

# Read each line, change -A to -D and execute the command
while IFS= read -r line; do
  # Check if the line starts with "iptables -t nat -A PREROUTING"
  if [[ $line == "iptables -t nat -A PREROUTING"* ]]; then
    # Replace -A with -D
    delete_command=$(echo "$line" | sed 's/-A/-D/')
    # Hi
    # Execute the modified command
    echo "Executing: $delete_command"
    eval "$delete_command"
  fi
done < "$file"

echo "Finished executing commands"
pct destroy $ID
echo "Removed!"
rm $file
