import React from "react"
import { Button } from "react-bootstrap"
import { AiOutlineArrowUp } from "react-icons/ai"

interface CustomProps {
}

type Props = CustomProps & React.ComponentProps<typeof Button>;

export const ArrowUp: React.FC<Props> = (props) => {
  return (
    <Button variant="secondary" className="p-1" size="sm" {...props} {...props}>
      <AiOutlineArrowUp size={20} />
    </Button>
  )
}
