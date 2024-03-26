import React from "react"
import { Button } from "react-bootstrap"
import { AiOutlineArrowDown } from "react-icons/ai"

interface CustomProps {
}

type Props = CustomProps & React.ComponentProps<typeof Button>;

export const ArrowDown: React.FC<Props> = (props) => {
  const { className, ...rest } = props
  return (
    <Button variant="secondary" className={`p-1 $ ${className}`} size="sm" {...rest}>
      <AiOutlineArrowDown size={20} />
    </Button>
  )
}
